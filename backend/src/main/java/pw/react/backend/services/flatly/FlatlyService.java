package pw.react.backend.services.flatly;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.user.User;
import pw.react.backend.dto.request.flatly.CreateFlatlyBookingRequest;
import pw.react.backend.integrations.flatly.dto.*;
import pw.react.backend.integrations.flatly.dto.responses.FlatlyBookingDetailsResponse;
import pw.react.backend.integrations.flatly.dto.responses.FlatlyBookingDetailsExtendedResponse;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.integrations.flatly.FlatlyClient;
import pw.react.backend.integrations.flatly.dto.requests.FlatlyCreateBookingRequest;
import pw.react.backend.integrations.flatly.dto.responses.FlatlyCreateBookingResponse;
import pw.react.backend.repositories.booking.BookingRepository;
import pw.react.backend.repositories.booking.BookingStatusDictionaryRepository;
import pw.react.backend.repositories.user.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlatlyService {

    private static final int MAX_RETRIES = 3;

    private final FlatlyClient flatlyClient;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BookingStatusDictionaryRepository bookingStatusDictionaryRepository;

    @Transactional(readOnly = true)
    public List<FlatlyFlatDto> getAvailableFlatsWithImages(LocalDateTime dateFrom, LocalDateTime dateTo) {

        if (dateFrom == null || dateTo == null) {
            throw new IllegalArgumentException("dateFrom and dateTo are required");
        }
        if (!dateTo.isAfter(dateFrom)) {
            throw new IllegalArgumentException("dateTo must be after dateFrom");
        }

        log.info("Calling Flatly getAvailableFlats: dateFrom={}, dateTo={}", dateFrom, dateTo);

        var resp = flatlyClient.getAvailableFlats(dateFrom, dateTo);
        HttpStatusCode status = resp.getStatusCode();

        log.info("Flatly getAvailableFlats status={}", status.value());

        if (status.value() != 200) {
            throw new IllegalStateException("Flatly getAvailableFlats failed. status=" + status.value());
        }

        List<FlatlyAvailableFlatDto> flats = resp.getBody() == null ? List.of() : resp.getBody();
        if (flats.isEmpty()) return List.of();

        List<FlatlyFlatDto> out = new ArrayList<>(flats.size());
        for (FlatlyAvailableFlatDto f : flats) {
            out.add(enrichWithImagesSequential(f));
        }
        return out;
    }

    private FlatlyFlatDto enrichWithImagesSequential(FlatlyAvailableFlatDto flat) {
        List<FlatlyFlatImageDto> images = fetchImagesWithRetry(flat.getId());

        FlatlyFlatDto dto = new FlatlyFlatDto();
        dto.setId(flat.getId());
        dto.setName(flat.getName());
        dto.setCity(flat.getCity());
        dto.setCountry(flat.getCountry());
        dto.setRooms(flat.getRooms());
        dto.setMaxGuests(flat.getMaxGuests());
        dto.setImages(images);

        return dto;
    }

    private List<FlatlyFlatImageDto> fetchImagesWithRetry(UUID flatId) {
        HttpStatusCode status = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            var resp = flatlyClient.getFlatImages(flatId);
            status = resp.getStatusCode();

            log.info("Flatly getFlatImages attempt {} flatId={} status={}", attempt, flatId, status.value());

            if (status.value() == 200) {
                return resp.getBody() == null ? List.of() : resp.getBody();
            }

            if (status.value() == 404) {
                return List.of();
            }
        }

        // degrade gracefully
        log.warn("Flatly getFlatImages failed for flatId={}, lastStatus={}", flatId, status == null ? null : status.value());
        return List.of();
    }

    @Transactional
    public Booking createFlatBookingInFlatly(CreateFlatlyBookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        Booking booking = bookingRepository.findFirstByUser_UserIdOrderByBookingIdDesc(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No bookings exist for userId=" + user.getUserId() + ". Create a car booking first."
                ));

        BookingStatusDictionary created = bookingStatusDictionaryRepository.findByName("CREATED")
                .orElseThrow(() -> new ResourceNotFoundException("CREATED status missing (seed data)"));

        FlatlyCreateBookingRequest outbound = new FlatlyCreateBookingRequest();
        outbound.setFlatId(request.getFlatId());
        outbound.setCheckInDate(request.getCheckInDate());
        outbound.setCheckOutDate(request.getCheckOutDate());
        outbound.setGuestsCount(request.getGuestsCount());

        log.info(
                "Calling Flatly createBooking: flatId={}, guestsCount={}, checkIn={}, checkOut={}",
                outbound.getFlatId(),
                outbound.getGuestsCount(),
                outbound.getCheckInDate(),
                outbound.getCheckOutDate()
        );

        FlatlyCreateBookingResponse flatlyBody = null;
        HttpStatusCode flatlyStatus = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            var response = flatlyClient.createBooking(outbound);
            flatlyStatus = response.getStatusCode();
            int code = flatlyStatus.value();
            log.info("Flatly createBooking attempt {} statusCode={}", attempt, code);

            if (code == 201 || code == 400 || code == 404 || code == 409) {
                flatlyBody = response.getBody();
                break;
            }
        }

        if (flatlyStatus == null) {
            throw new IllegalStateException("Flatly createBooking failed: no response");
        }

        FlatlyResponseHandler.assertCreateBooking(flatlyStatus);

        if (flatlyBody == null || flatlyBody.getId() == null) {
            throw new IllegalStateException("Flatly: returned 201 but did not return booking id.");
        }

        booking.setFlatBookingStatus(created);
        booking.setProviderExternalBookingId(flatlyBody.getId()); // UUID
        Booking updated = bookingRepository.save(booking);

        log.info("Flatly booking attached: userId={}, localBookingId={}, flatlyBookingId={}",
                user.getUserId(), updated.getBookingId(), flatlyBody.getId());

        return updated;
    }

    private boolean hasFlatPart(Booking booking) {
        return booking.getFlatBookingStatus() != null || booking.getProviderExternalBookingId() != null;
    }

    @Transactional(readOnly = true)
    public FlatlyBookingDetailsResponse getFlatBookingDetailsWithImages(UUID flatBookingId) {

        FlatlyBookingDto booking = getFlatBookingDetails(flatBookingId);
        UUID flatId = booking.getFlatId();

        FlatlyFlatDetailsDto flat = null;
        List<FlatlyFlatImageDto> images = List.of();

        if (flatId != null) {
            // 1) fetch flat details
            var flatResp = flatlyClient.getFlatById(flatId);
            if (flatResp.getStatusCode().value() == 200) {
                flat = flatResp.getBody();
            }

            // 2) fetch images
            images = fetchImagesWithRetry(flatId);
        }

        FlatlyBookingDetailsResponse res = new FlatlyBookingDetailsResponse();
        res.setBooking(booking);
        res.setFlat(flat);
        res.setFlatImages(images);

        return res;
    }

    @Transactional(readOnly = true)
    public FlatlyBookingDto getFlatBookingDetails(UUID flatBookingId) {

        HttpStatusCode status = null;
        FlatlyBookingDto body = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            var response = flatlyClient.getFlatBookingById(flatBookingId);
            status = response.getStatusCode();

            log.info("Flatly getFlatBookingDetails attempt {} status={}", attempt, status.value());

            if (status.value() == 200) {
                body = response.getBody();
                if (body != null) break;
            }
            if (status.value() == 404) break;
        }

        if (status == null || status.value() != 200 || body == null) {
            throw new IllegalStateException("Flatly getFlatBookingDetails failed after retries. Last status=" +
                    (status == null ? "null" : status.value()));
        }

        return body;
    }

    @Transactional(readOnly = true)
    public List<FlatlyBookingDetailsResponse> getUserFlatBookings(Integer userId) {

        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }

        // Pull all local bookings that have Flatly booking UUID attached
        List<Booking> all = bookingRepository
                .findAllByUser_UserIdAndProviderExternalBookingIdIsNotNullOrderByBookingIdDesc(userId);

        if (all.isEmpty()) return List.of();

        List<FlatlyBookingDetailsResponse> out = new ArrayList<>();

        for (Booking b : all) {
            if (!hasFlatPart(b)) continue;

            UUID flatlyBookingId = b.getProviderExternalBookingId();
            if (flatlyBookingId == null) continue;

            try {
                out.add(getFlatBookingDetailsWithImages(flatlyBookingId));
            } catch (Exception ex) {
                // Degrade gracefully: if partner is flaky, skip that record instead of failing whole Home tab
                log.warn("Skipping Flatly booking {} due to error: {}", flatlyBookingId, ex.getMessage());
            }
        }

        return out;
    }

    @Transactional(readOnly = true)
    public List<FlatlyBookingDetailsExtendedResponse> getAllFlatBookings() {
        List<Booking> all = bookingRepository.findAllByProviderExternalBookingIdIsNotNullOrderByBookingIdDesc();
        if (all.isEmpty()) return List.of();

        List<FlatlyBookingDetailsExtendedResponse> out = new ArrayList<>();
        for (Booking b : all) {
            if (!hasFlatPart(b)) continue;

            UUID flatlyBookingId = b.getProviderExternalBookingId();
            if (flatlyBookingId == null) continue;

            try {
                FlatlyBookingDetailsResponse base = getFlatBookingDetailsWithImages(flatlyBookingId);

                FlatlyBookingDetailsExtendedResponse ext = new FlatlyBookingDetailsExtendedResponse();
                ext.setBooking(base.getBooking());
                ext.setFlat(base.getFlat());
                ext.setFlatImages(base.getFlatImages());
                ext.setUserId(b.getUser() != null ? b.getUser().getUserId() : null);
                ext.setFlatBookingStatus(b.getFlatBookingStatus() != null ? b.getFlatBookingStatus().getName() : null);

                out.add(ext);
            } catch (Exception ex) {
                log.warn("Skipping Flatly booking {} due to error: {}", flatlyBookingId, ex.getMessage());
            }
        }

        return out;
    }

    @Transactional
    public boolean cancelFlatBookingInFlatly(UUID bookingId) {

        Booking booking = bookingRepository.findByProviderExternalBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!hasFlatPart(booking)) {
            throw new ResourceNotFoundException("Booking " + bookingId + " does not contain a Flatly booking");
        }

        if (booking.getProviderExternalBookingId() == null) {
            throw new IllegalStateException("Booking " + bookingId + " has no Flatly external booking id");
        }

        UUID flatBookingId = booking.getProviderExternalBookingId();

        BookingStatusDictionary cancelled =
                bookingStatusDictionaryRepository.findByName("CANCELLED")
                        .orElseThrow(() -> new ResourceNotFoundException("CANCELLED status missing (seed data)"));

        if (booking.getFlatBookingStatus() != null &&
                "CANCELLED".equalsIgnoreCase(booking.getFlatBookingStatus().getName())) {
            log.info("Flatly booking already cancelled locally: bookingId={}, flatlyBookingId={}",
                    bookingId, booking.getProviderExternalBookingId());
            return false;
        }

        HttpStatusCode flatlyStatus = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            var response = flatlyClient.cancelBooking(flatBookingId);
            flatlyStatus = response.getStatusCode();
            int code = flatlyStatus.value();

            log.info("Flatly cancelBooking attempt {} status={}", attempt, code);

            if (code == 200 || code == 404) {
                break;
            }
        }

        if (flatlyStatus == null) {
            throw new IllegalStateException("Flatly cancelBooking failed: no response");
        }

        if (flatlyStatus.value() != 200 && flatlyStatus.value() != 404) {
            throw new IllegalStateException("Flatly cancelBooking failed. status=" + flatlyStatus.value());
        }

        FlatlyResponseHandler.assertCancelBooking(flatlyStatus, flatBookingId);

        booking.setFlatBookingStatus(cancelled);
        bookingRepository.save(booking);

        log.info("Flatly booking cancelled: BookingId={}, flatlyBookingId={}", bookingId, flatBookingId);
        return true;
    }
}
