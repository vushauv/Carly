package pw.react.backend.services.booking;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import pw.react.backend.domain.Location;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.BookingStatusDictionary;
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
import pw.react.backend.repositories.booking.BookingStatusDictionaryRepository;
import pw.react.backend.services.flatly.FlatlyService;
import pw.react.backend.repositories.LocationRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingMainService implements BookingService {

    private static final String CANCELLED_STATUS = "CANCELLED";
    private final BookingRepository repository;
    private final BookingStatusDictionaryRepository bookingStatusDictionaryRepository;
    private final LocationRepository locationRepository;
    private final FlatlyService flatlyService;
    private static final Integer defaultPickUpLocation = 1; //default PickUpLocation if not provided
    private static final Integer defaultReturnLocation = 2; //default ReturnLocation if not provided

    @Override
    public void updateBooking(Integer id, Booking updatedBooking) throws ResourceNotFoundException {
        if (repository.existsById(id)) {
            updatedBooking.setBookingId(id);
            Booking result = repository.save(updatedBooking);
            log.info("Booking with id {} updated.", id);
            return;
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
    @Transactional
    public List<Booking> batchSave(List<Booking> bookings) {

        if (bookings == null || bookings.isEmpty()) {
            log.warn("Bookings collection is empty or null.");
            return Collections.emptyList();
        }

        BookingStatusDictionary created =
                bookingStatusDictionaryRepository.findByName("CREATED")
                        .orElseThrow(() -> new ResourceNotFoundException("CREATED status not found. Seed data missing."));

        var defaultPickup = locationRepository.findById(defaultPickUpLocation)
                .orElseThrow(() -> new IllegalStateException("Default location missing"));
        var defaultReturn = locationRepository.findById(defaultReturnLocation)
                .orElseThrow(() -> new IllegalStateException("Default location missing"));

        for (Booking booking : bookings) {

            booking.setCarBookingStatus(created);
            booking.setEnabled(true);

            // using defaults
            if (booking.getPickupLocation() == null) {
                booking.setPickupLocation(defaultPickup);
            }
            if (booking.getReturnLocation() == null) {
                booking.setReturnLocation(defaultReturn);
            }
        }

        return repository.saveAll(bookings);
    }

    @Override
    public List<Booking> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Booking> getById(Integer bookingId) {
        return repository.findById(bookingId);
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

        //some ORM magic, but allows to filer based on the input criteria
        Specification<Booking> spec = Specification.where(BookingSpecifications.isEnabled())
                .and(BookingSpecifications.hasBookingId(criteria.getBookingId()))
                .and(BookingSpecifications.hasUserId(criteria.getUserId()))
                .and(BookingSpecifications.hasStatusName(criteria.getStatus()))
                .and(BookingSpecifications.dateFrom(criteria.getDateFrom()))
                .and(BookingSpecifications.dateTo(criteria.getDateTo()));

        return repository.findAll(spec, PageRequest.of(p, s));
    }

    @Override
    @Transactional
    public void cancelCarBooking(Integer bookingId) {
        Booking booking = repository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        BookingStatusDictionary cancelled = bookingStatusDictionaryRepository.findByName(CANCELLED_STATUS)
                .orElseThrow(() -> new ResourceNotFoundException("CANCELLED status missing (seed data)"));

        //safeguard - if already cancelled then do nothing
        if (booking.getCarBookingStatus() != null &&
                CANCELLED_STATUS.equalsIgnoreCase(booking.getCarBookingStatus().getName())) {
            return;
        }

        booking.setCarBookingStatus(cancelled);
        repository.save(booking);

        log.info("Car booking cancelled: bookingId={}", bookingId);
    }

    @Override
    @Transactional
    public void cancelFlatBooking(Integer bookingId) {
        Booking booking = repository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        BookingStatusDictionary cancelled = bookingStatusDictionaryRepository.findByName(CANCELLED_STATUS)
                .orElseThrow(() -> new ResourceNotFoundException("CANCELLED status missing (seed data)"));

        //safeguard - if already cancelled then do nothing
        if (booking.getFlatBookingStatus() != null &&
                CANCELLED_STATUS.equalsIgnoreCase(booking.getFlatBookingStatus().getName())) {
            return;
        }
        //TODO: after deciding, make sure we pass the correct one: our BookingId vs their FlatBookingId!!!

        //first we cancell the FlatBooking via their API,
        flatlyService.cancelFlatBookingInFlatly(bookingId);
        log.info("Flat booking cancelled on Flatly's side: bookingId={}", bookingId);

        //on success, we change the status in our system to 'Cancelled'
        booking.setFlatBookingStatus(cancelled);
        repository.save(booking);

        log.info("Flat booking cancelled on Carly's side: bookingId={}", bookingId);
    }

}
