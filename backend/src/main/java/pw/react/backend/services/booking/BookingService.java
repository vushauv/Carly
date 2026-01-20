package pw.react.backend.services.booking;

import pw.react.backend.domain.booking.Booking;
import pw.react.backend.dto.request.booking.BookingSearchCriteria;
import pw.react.backend.exceptions.ResourceNotFoundException;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface BookingService {

    void updateBooking(Integer id, Booking updatedBooking) throws ResourceNotFoundException;

    boolean deleteBooking(Integer bookingId);

    List<Booking> batchSave(List<Booking> bookings);

    Optional<Booking> getById(Integer bookingId);

    List<Booking> getAll();

    List<Booking> getBookingsPage(int page, int size);
    Page<Booking> search(BookingSearchCriteria criteria, int page, int size);

    void cancelCarBooking(Integer bookingId);
    void cancelFlatBooking(Integer bookingId);

}
