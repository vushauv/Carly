package pw.react.backend.services.parkly;

import org.apache.coyote.BadRequestException;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.dto.request.parkly.ParklyCreateBookingRequestDto;
import pw.react.backend.dto.response.parkly.ParklyGetBookingResponseDto;
import pw.react.backend.exceptions.ResourceNotFoundException;

import java.nio.file.AccessDeniedException;

public interface ParklyService {
    Booking createCarBooking(Booking booking) throws BadRequestException, ResourceNotFoundException;
    void cancelCarBooking(Integer bookingId) throws ResourceNotFoundException, AccessDeniedException;
    Booking getBookingById(Integer bookingId) throws ResourceNotFoundException, AccessDeniedException;
}

