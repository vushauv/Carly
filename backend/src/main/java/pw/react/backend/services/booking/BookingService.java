package pw.react.backend.services.booking;

import pw.react.backend.domain.booking.Booking;
import pw.react.backend.exceptions.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

public interface BookingService {

    Booking updateBooking(Integer id, Booking updatedBooking) throws ResourceNotFoundException;

    boolean deleteBooking(Integer bookingId);

    List<Booking> batchSave(List<Booking> bookings);

    Optional<Booking> getById(Integer bookingId);

    List<Booking> getAll();

    List<Booking> getBookingsPage(int page, int size);
}
