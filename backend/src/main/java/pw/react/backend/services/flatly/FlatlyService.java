package pw.react.backend.services.flatly;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

        booking.setFlatBookingStatus(created);

        // Call Flatly (we pass OUR bookingId as correlation)
        FlatlyCreateBookingRequest outbound = new FlatlyCreateBookingRequest();
        outbound.setBookingId(booking.getBookingId().longValue());
        outbound.setFlatId(request.getFlatId());
        outbound.setDateFrom(request.getDateFrom());
        outbound.setDateTo(request.getDateTo());

        FlatlyCreateBookingResponse flatlyResponse = flatlyClient.createBooking(outbound);
        if (flatlyResponse == null || flatlyResponse.getFlatBookingId() == null) {
            throw new IllegalStateException("Flatly returned empty response or missing flatBookingId");
        }

        // Store Flatly external booking id (ONLY after Flatly success)
        booking.setProviderExternalBookingId(flatlyResponse.getFlatBookingId());

        Booking updated = bookingRepository.save(booking);

        log.info("Flatly booking attached: userId={}, localBookingId={}, flatlyBookingId={}",
                user.getUserId(), updated.getBookingId(), flatlyResponse.getFlatBookingId());

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

        //TODO: we cancel the booking using their BookingId or ours?
        flatlyClient.cancelBooking(booking.getProviderExternalBookingId());

        booking.setFlatBookingStatus(cancelled);
        bookingRepository.save(booking);
        log.info(
                "Flatly booking cancelled: localBookingId={}, flatlyBookingId={}",
                bookingId,
                booking.getProviderExternalBookingId()
        );
        return true;
    }
}
