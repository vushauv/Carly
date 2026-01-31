package pw.react.backend.services.parkly;

import pw.react.backend.domain.booking.Booking;
import pw.react.backend.dto.request.parkly.ParklyCreateCarBookingRequest;
import pw.react.backend.dto.response.parkly.ParklyGetBookingResponseDto;
import pw.react.backend.dto.response.parkly.ParklyBookingResponse;
import pw.react.backend.exceptions.ResourceNotFoundException;

import java.nio.file.AccessDeniedException;

public interface ParklyService {
    ParklyBookingResponse createCarBooking(ParklyCreateCarBookingRequest request);
    boolean cancelCarBooking(Integer externalBookingId);
    ParklyGetBookingResponseDto getCarBookingByExternalBookingId(Integer externalBookingId);
    Booking getBookingById(Integer bookingId) throws ResourceNotFoundException, AccessDeniedException;
}

