package pw.react.backend.services.flatly;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.user.User;
import pw.react.backend.dto.flatly.CreateFlatlyBookingRequest;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.integrations.flatly.FlatlyClient;
import pw.react.backend.integrations.flatly.dto.FlatlyCreateBookingRequest;
import pw.react.backend.integrations.flatly.dto.FlatlyCreateBookingResponse;
import pw.react.backend.repositories.booking.BookingRepository;
import pw.react.backend.repositories.booking.BookingStatusDictionaryRepository;
import pw.react.backend.repositories.user.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlatlyService {

    private static final int MAX_RETRIES = 3;

    private final FlatlyClient flatlyClient;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BookingStatusDictionaryRepository bookingStatusDictionaryRepository;

    @Transactional
    public Booking createFlatBookingInFlatly(CreateFlatlyBookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        //if not bookings to 'attach' the FlatBooking to, we throw an exception
        Booking booking = bookingRepository.findFirstByUser_UserIdOrderByBookingIdDesc(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No bookings exist for userId=" + user.getUserId() + ". Create a car booking first."
                ));

        BookingStatusDictionary created = bookingStatusDictionaryRepository.findByName("CREATED")
                .orElseThrow(() -> new ResourceNotFoundException("CREATED status missing (seed data)"));

        // Call Flatly (we pass OUR bookingId as correlation)
        FlatlyCreateBookingRequest outbound = new FlatlyCreateBookingRequest();
        outbound.setPartnerBookingRef(booking.getBookingId());
        outbound.setFlatId(request.getFlatId());
        outbound.setDateFrom(request.getDateFrom());
        outbound.setDateTo(request.getDateTo());

        log.info(
                "Calling Flatly createBooking: partnerBookingRef={}, flatId={}, dateFrom={}, dateTo={}",
                outbound.getPartnerBookingRef(),
                outbound.getFlatId(),
                outbound.getDateFrom(),
                outbound.getDateTo()
        );

        FlatlyCreateBookingResponse flatlyBody = null;
        HttpStatusCode flatlyStatus = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            var response = flatlyClient.createBooking(outbound);
            flatlyStatus = response.getStatusCode();

            log.info("Flatly createBooking attempt {} status={}", attempt, flatlyStatus.value());

            //must be 201 - Created
            if (flatlyStatus.value() == 201) {
                flatlyBody = response.getBody();
                if (flatlyBody != null && flatlyBody.getId() != null) {
                    break;
                }
            }
        }

        if (flatlyStatus == null || flatlyStatus.value() != 201) {
            throw new IllegalStateException(
                    "Flatly createBooking failed after retries. Last status=" +
                            (flatlyStatus == null ? "null" : flatlyStatus.value())
            );
        }
        // Mark status and set ExternalBookingId only on success
        booking.setFlatBookingStatus(created);
        booking.setProviderExternalBookingId(flatlyBody.getId());

        Booking updated = bookingRepository.save(booking);

        log.info("Flatly booking attached: userId={}, localBookingId={}, flatlyBookingId={}",
                user.getUserId(), updated.getBookingId(), flatlyBody.getId());

        return updated;
    }

    /**
     * Defines whether the Booking row is already used as a Flat booking container.
     * Adjust this predicate if you want a different rule.
     */
    private boolean hasFlatPart(Booking booking) {
        return booking.getFlatBookingStatus() != null || booking.getProviderExternalBookingId() != null;
    }

    @Transactional
    public boolean cancelFlatBookingInFlatly(Integer bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId) );

        if (!hasFlatPart(booking)) {
            throw new ResourceNotFoundException(
                    "Booking " + bookingId + " does not contain a Flatly booking"
            );
        }
        if (booking.getProviderExternalBookingId() == null) {
            throw new IllegalStateException(
                    "Booking " + bookingId + " has no Flatly external booking id"
            );
        }

        BookingStatusDictionary cancelled =
                bookingStatusDictionaryRepository.findByName("CANCELLED")
                        .orElseThrow(() -> new ResourceNotFoundException("CANCELLED status missing (seed data)"));

        if (booking.getFlatBookingStatus() == cancelled) {
            log.info(
                    "Flatly booking already cancelled locally: bookingId={}, flatlyBookingId={}",
                    bookingId,
                    booking.getProviderExternalBookingId()
            );
            return false;
        }

        HttpStatusCode flatlyStatus = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            var response = flatlyClient.cancelBooking(booking.getProviderExternalBookingId());
            flatlyStatus = response.getStatusCode();

            log.info("Flatly cancelBooking attempt {} status={}", attempt, flatlyStatus.value());

            if (flatlyStatus.value() == 200) {
                break;
            }
        }

        if (flatlyStatus == null || flatlyStatus.value() != 200) {
            throw new IllegalStateException(
                    "Flatly cancelBooking failed after retries. Last status=" +
                            (flatlyStatus == null ? "null" : flatlyStatus.value())
            );
        }

        booking.setFlatBookingStatus(cancelled);
        bookingRepository.save(booking);
        log.info(
                "Flatly booking cancelled: BookingId={}, flatlyBookingId={}",
                bookingId,
                booking.getProviderExternalBookingId()
        );
        return true;
    }
}
