package pw.react.backend.services.booking;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.booking.BookingRepository;
import org.springframework.data.domain.Page;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import pw.react.backend.dto.request.booking.BookingSearchCriteria;
import pw.react.backend.repositories.booking.BookingSpecifications;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingMainService implements BookingService {

    private final BookingRepository repository;

    @Override
    public Booking updateBooking(Integer id, Booking updatedBooking) throws ResourceNotFoundException {
        if (repository.existsById(id)) {
            updatedBooking.setBookingId(id);
            Booking result = repository.save(updatedBooking);
            log.info("Booking with id {} updated.", id);
            return result;
        }
        throw new ResourceNotFoundException(String.format("Booking with id [%d] not found.", id));
    }

    @Override
    public boolean deleteBooking(Integer bookingId) {
        return repository.findById(bookingId)
                .map(booking -> {
                    booking.setEnabled(false);
                    repository.save(booking);
                    log.info("Booking with id {} soft-deleted (IsEnabled=0).", bookingId);
                    return true;
                })
                .orElse(false);
    }

    @Override
    public List<Booking> batchSave(List<Booking> bookings) {
        if (bookings != null && !bookings.isEmpty()) {
            return repository.saveAll(bookings);
        } else {
            log.warn("Bookings collection is empty or null.");
            return Collections.emptyList();
        }
    }

    @Override
    public Optional<Booking> getById(Integer bookingId) {
        return repository.findById(bookingId);
    }

    @Override
    public List<Booking> getAll() {
        return repository.findAll();
    }

    @Override
    public List<Booking> getBookingsPage(int pageNumber, int pageSize) {
        int defaultPageSize = 10;
        return repository.findAll(PageRequest.of(pageNumber, pageSize == 0 ? defaultPageSize : pageSize)).getContent();
    }

    @Override
    public Page<Booking> search(BookingSearchCriteria criteria, int pageNumber, int pageSize) {
        int defaultPageSize = 10;
        int p = Math.max(pageNumber, 0);
        int s = (pageSize <= 0 ? defaultPageSize : pageSize);

        Specification<Booking> spec = Specification.where(BookingSpecifications.isEnabled())
                .and(BookingSpecifications.hasBookingId(criteria.getBookingId()))
                .and(BookingSpecifications.hasUserId(criteria.getUserId()))
                .and(BookingSpecifications.hasStatusName(criteria.getStatus()))
                .and(BookingSpecifications.dateFrom(criteria.getDateFrom()))
                .and(BookingSpecifications.dateTo(criteria.getDateTo()));

        return repository.findAll(spec, PageRequest.of(p, s));
    }

}
