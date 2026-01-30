package pw.react.backend.services.booking;

import org.apache.coyote.BadRequestException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.dto.models.DateRange;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.exceptions.custom.CarBookingConflictException;
import pw.react.backend.repositories.booking.BookingRepository;
import org.springframework.data.domain.Page;

import java.time.LocalTime;
import java.time.chrono.ChronoLocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.domain.Specification;
import pw.react.backend.dto.request.booking.BookingSearchCriteria;
import pw.react.backend.repositories.booking.BookingSpecifications;
import pw.react.backend.repositories.booking.BookingStatusDictionaryRepository;
import pw.react.backend.repositories.car.CarRepository;
import pw.react.backend.repositories.user.UserRepository;
import pw.react.backend.services.car.CarService;
import pw.react.backend.services.car.model.CarSearchCriteria;
import pw.react.backend.services.flatly.FlatlyService;
import pw.react.backend.repositories.LocationRepository;
import pw.react.backend.services.user.UserService;
import pw.react.backend.utils.DateUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingMainService implements BookingService {
    private final BookingRepository bookingRepository;
    private final BookingStatusDictionaryRepository bookingStatusDictionaryRepository;
    private final LocationRepository locationRepository;
    private final FlatlyService flatlyService;
    private final CarService carService;
    private static final Integer defaultPickUpLocation = 1; //default PickUpLocation if not provided
    private static final Integer defaultReturnLocation = 2; //default ReturnLocation if not provided
    private final UserService userService;

    @Override
    public void updateBooking(Integer id, Booking updatedBooking) throws ResourceNotFoundException {
        if (bookingRepository.existsById(id)) {
            updatedBooking.setBookingId(id);
            Booking result = bookingRepository.save(updatedBooking);
            log.info("Booking with id {} updated.", id);
            return;
        }
        throw new ResourceNotFoundException(String.format("Booking with id [%d] not found.", id));
    }

    @Override
    public boolean deleteBooking(Integer bookingId) {
        return bookingRepository.findById(bookingId)
                .map(booking -> {
                    booking.setEnabled(false);
                    bookingRepository.save(booking);
                    log.info("Booking with id {} soft-deleted (IsEnabled=0).", bookingId);
                    return true;
                })
                .orElse(false);
    }

    @Override
    @Transactional
    public List<Booking> batchSave(List<Booking> bookings) throws BadRequestException {
        BookingStatusDictionary created =
                bookingStatusDictionaryRepository.findByName(BookingStatus.CREATED.name())
                        .orElseThrow(() -> new ResourceNotFoundException(BookingStatus.CREATED.name() + " status not found. Seed data missing."));

        for (Booking booking : bookings) {
            var carId = booking.getCar().getCarId();
            var userId = booking.getBookingId();
            var dateRange = new DateRange(booking.getCarBookingDateFrom(), booking.getCarBookingDateTo());
            var now = LocalTime.now();

            if(dateRange.getFrom().isBefore(ChronoLocalDateTime.from(now)))
                throw new BadRequestException("The dateFrom cannot be before current time");
            // Checks if a valid dateRange is provided
            DateUtils.normaliseDates(dateRange);

            booking.setCarBookingStatus(created);
            if(!userService.userExistsById(userId))
                throw new ResourceNotFoundException("User with id "
                        + booking.getUser().getUserId() +
                        " not found. The request is cancelled.");

            if(!carService.checkCarAvailability(carId, dateRange))
                throw new CarBookingConflictException(carId, dateRange);

            // using defaults
            if (booking.getPickupLocation() == null) {
                var defaultPickup = locationRepository.findById(defaultPickUpLocation)
                        .orElseThrow(() -> new IllegalStateException("Default location missing"));
                booking.setPickupLocation(defaultPickup);
            }
            if (booking.getReturnLocation() == null) {
                var defaultReturn = locationRepository.findById(defaultReturnLocation)
                        .orElseThrow(() -> new IllegalStateException("Default location missing"));
                booking.setReturnLocation(defaultReturn);
            }
        }
        return bookingRepository.saveAll(bookings);
    }

    @Override
    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    @Override
    public Optional<Booking> getById(Integer bookingId) {
        return bookingRepository.findById(bookingId);
    }

    @Override
    public List<Booking> getBookingsPage(int pageNumber, int pageSize) {
        int defaultPageSize = 10;
        int page = Math.max(pageNumber, 0);
        return bookingRepository.findAll(PageRequest.of(page, pageSize <= 0 ? defaultPageSize : pageSize)).getContent();
    }

    @Override
    public Page<Booking> search(BookingSearchCriteria criteria, int pageNumber, int pageSize) {
        int defaultPageSize = 10;
        int page = Math.max(pageNumber, 0);
        int size = (pageSize <= 0 ? defaultPageSize : pageSize);

        // TODO: IntelliSense tells me 'where' is deprecated
        //some ORM magic, but allows to filer based on the input criteria
        Specification<Booking> spec = Specification.where(BookingSpecifications.isEnabled())
                .and(BookingSpecifications.hasBookingId(criteria.getBookingId()))
                .and(BookingSpecifications.hasUserId(criteria.getUserId()))
                .and(BookingSpecifications.hasStatusName(criteria.getStatus().name()))
                .and(BookingSpecifications.dateFrom(criteria.getDateFrom()))
                .and(BookingSpecifications.dateTo(criteria.getDateTo()));

        return bookingRepository.findAll(spec, PageRequest.of(page, size));
    }

    @Override
    @Transactional
    public void cancelCarBooking(Integer bookingId) {
        var CANCELLED_STATUS = BookingStatus.CANCELLED.name();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        BookingStatusDictionary cancelled = bookingStatusDictionaryRepository.findByName(CANCELLED_STATUS)
                .orElseThrow(() -> new ResourceNotFoundException(CANCELLED_STATUS + " status missing (seed data)"));

        //safeguard - if already cancelled then do nothing
        if (booking.getCarBookingStatus() != null &&
                CANCELLED_STATUS.equalsIgnoreCase(booking.getCarBookingStatus().getName())) {
            return;
        }

        booking.setCarBookingStatus(cancelled);
        bookingRepository.save(booking);

        log.info("Car booking cancelled: bookingId={}", bookingId);
    }

    @Override
    @Transactional
    public void cancelFlatBooking(Integer bookingId) {
        var CANCELLED_STATUS = BookingStatus.CANCELLED.name();
        Booking booking = bookingRepository.findById(bookingId)
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
        bookingRepository.save(booking);

        log.info("Flat booking cancelled on Carly's side: bookingId={}", bookingId);
    }

}
