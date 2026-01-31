package pw.react.backend.services.parkly;

import pw.react.backend.domain.booking.Booking;
import pw.react.backend.dto.request.parkly.ParklyCreateCarBookingRequest;
import pw.react.backend.dto.response.parkly.ParklyBookingDetailsResponse;
import pw.react.backend.dto.response.parkly.ParklyBookingResponse;
import pw.react.backend.exceptions.ResourceNotFoundException;

import java.util.Optional;

public interface ParklyService {
    ParklyBookingResponse createCarBooking(ParklyCreateCarBookingRequest request);
    boolean cancelCarBooking(Integer externalBookingId);
    ParklyBookingDetailsResponse getCarBookingByExternalBookingId(Integer externalBookingId);
    Optional<Booking> getBookingById(Integer bookingId) throws ResourceNotFoundException;
}

