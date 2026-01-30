package pw.react.backend.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.controller.path.PathResolver;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.dto.mapper.booking.BookingCriteriaMapper;
import pw.react.backend.dto.mapper.booking.BookingMapper;
import pw.react.backend.dto.models.DateRange;
import pw.react.backend.dto.request.booking.CreateBookingRequest;
import pw.react.backend.dto.request.booking.UpdateBookingRequestDto;
import pw.react.backend.dto.response.booking.BookingResponse;
import pw.react.backend.dto.response.booking.GetBookingResponse;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.exceptions.custom.CarBookingConflictException;
import pw.react.backend.services.booking.BookingService;
import pw.react.backend.services.car.CarService;
import pw.react.backend.utils.DateUtils;

import java.time.LocalTime;
import java.time.chrono.ChronoLocalDateTime;
import java.util.Collection;
import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(path = BookingController.BOOKINGS_PATH)
@Slf4j
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class BookingController {
    public static final String BOOKINGS_PATH = PathResolver.Booking.Base;
    private final BookingService bookingService;
    private final BookingMapper bookingMapper;
    private final BookingCriteriaMapper bookingCriteriaMapper;
    private final CarService carService;

    @PostMapping
    public ResponseEntity<Collection<BookingResponse>> createBookings(
            @RequestHeader HttpHeaders headers,
            @Valid @RequestBody @NotEmpty List<CreateBookingRequest> requests
    ) throws BadRequestException {
        logHeaders(headers);
        List<Booking> toCreate = bookingMapper.createRequestToBookingList(requests);
        List<Booking> saved = bookingService.batchSave(toCreate);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bookingMapper.bookingToResponseList(saved));
    }

    // TODO: implement booking finalisation

    @GetMapping(path = "/{bookingId}")
    public ResponseEntity<GetBookingResponse> getBooking(
            @RequestHeader HttpHeaders headers,
            @PathVariable Integer bookingId
    ) {
        logHeaders(headers);
        GetBookingResponse result = bookingService.getById(bookingId)
                .map(bookingMapper::bookingToGetBookingResponse)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Booking with %d does not exist", bookingId)));

        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<GetBookingResponse>> getAllBookings(
            @RequestHeader HttpHeaders headers,
            @RequestParam(required = false) Integer bookingId,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) @Min(0) Integer page,
            @RequestParam(required = false) @Min(0) Integer size
    ) {
        logHeaders(headers);
        // no filters -> we get all bookings (pagination included)
        boolean noFilters = bookingId == null &&
                        status == null  &&
                        dateFrom == null &&
                        dateTo == null &&
                        userId == null;

        //if no filers passed, so just '/bookings' -> we get all booking (including pagination)
        if (noFilters) {
            if (page == null || size == null) {
                return ResponseEntity.ok(bookingMapper.bookingToGetBookingResponseList(bookingService.getAll()));
            }
            return ResponseEntity.ok(bookingMapper.bookingToGetBookingResponseList(bookingService.getBookingsPage(page, size)));
        }
        // Parse dates (ISO-8601 LocalDateTime, e.g. 2026-02-01T10:00:00)
        java.time.LocalDateTime from = DateUtils.parseLocalDateTime(dateFrom);
        java.time.LocalDateTime to = DateUtils.parseLocalDateTime(dateTo);
        var criteria = bookingCriteriaMapper.toBookingSearchCriteria(bookingId, status,
                to, from, userId);

        List<GetBookingResponse> result = bookingMapper.bookingToGetBookingResponseList(
                bookingService.search(criteria, page, size).getContent()
        );
        return ResponseEntity.ok(result);
    }


    @PutMapping(path = "/{bookingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateBooking(
            @RequestHeader HttpHeaders headers,
            @PathVariable Integer bookingId,
            @RequestBody UpdateBookingRequestDto updatedBooking
    ) throws BadRequestException, CarBookingConflictException {
        // TODO: this logic should be moved to Service, but because of design of update here, the logic is temporarily here
        //only used in the admin panel
        logHeaders(headers);
        Booking existing = bookingService.getById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Booking with %d does not exist", bookingId)));

        boolean dateChanged = updatedBooking.getCarBookingDateFrom() != null
                || updatedBooking.getCarBookingDateTo() != null;
        var carId = existing.getCar().getCarId();
        var dateRange = new DateRange();
        var now = LocalTime.now();

        // Only if
        if(dateChanged) {
            // Checks whether dates are correct and which has changed
            dateRange.setFrom(updatedBooking.getCarBookingDateFrom() == null ?
                    existing.getCarBookingDateFrom() : updatedBooking.getCarBookingDateFrom());
            dateRange.setTo(updatedBooking.getCarBookingDateTo() == null ?
                    existing.getCarBookingDateTo() : updatedBooking.getCarBookingDateTo());

            if (dateRange.getFrom().isBefore(ChronoLocalDateTime.from(now)))
                throw new BadRequestException("The dateFrom cannot be before current time");

            DateUtils.normaliseDates(dateRange);

            boolean isAvailable = carService.checkCarAvailability(carId, dateRange);
            if(!isAvailable)
                throw new CarBookingConflictException(carId, dateRange);
        }
        // We merge update only if car is available
        // Merge only provided fields (non-null)
        bookingMapper.applyUpdate(updatedBooking, existing);
        log.info(String.format("Booking with id %s successfully modified.", existing.getBookingId()));
        bookingService.updateBooking(bookingId, existing);

    }

    @DeleteMapping(path = "/{bookingId}")
    public ResponseEntity<String> deleteBooking(
            @RequestHeader HttpHeaders headers,
            @PathVariable Integer bookingId
    ) {
        logHeaders(headers);

        boolean deleted = bookingService.deleteBooking(bookingId);
        if (!deleted) {
            return ResponseEntity.badRequest().body(String.format("Booking with id %s does not exist.", bookingId));
        }
        return ResponseEntity.ok(String.format("Booking with id %s deleted.", bookingId));
    }

    //instead of reusing the PUT method, we create dedicated endpoints only for cancellation - easier to hook up
    @PostMapping(path = "/{bookingId}/cancel-car")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelCarBooking(
            @RequestHeader HttpHeaders headers,
            @PathVariable Integer bookingId
    ) {
        logHeaders(headers);
        bookingService.cancelCarBooking(bookingId);
    }

    @PostMapping(path = "/{bookingId}/cancel-flat")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelFlatBooking(
            @RequestHeader HttpHeaders headers,
            @PathVariable Integer bookingId
    ) {
        logHeaders(headers);
        bookingService.cancelFlatBooking(bookingId);
    }

    private void logHeaders(@RequestHeader HttpHeaders headers) {
        log.info("Controller request headers {}",
                headers.entrySet()
                        .stream()
                        .map(entry -> String.format("%s->[%s]", entry.getKey(), String.join(",", entry.getValue())))
                        .collect(joining(","))
        );
    }
}
