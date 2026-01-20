package pw.react.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.dto.mapper.BookingMapper;
import pw.react.backend.dto.request.booking.BookingSearchCriteria;
import pw.react.backend.dto.request.booking.CreateBookingRequest;
import pw.react.backend.dto.request.booking.UpdateBookingRequest;
import pw.react.backend.dto.response.booking.BookingResponse;
import pw.react.backend.dto.response.booking.GetBookingResponse;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.services.booking.BookingService;

import java.util.Collection;
import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(path = BookingController.BOOKINGS_PATH)
@Slf4j
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class BookingController {

    public static final String BOOKINGS_PATH = "/bookings";

    private final BookingService bookingService;
    private final BookingMapper bookingMapper;

    private void logHeaders(@RequestHeader HttpHeaders headers) {
        log.info("Controller request headers {}",
                headers.entrySet()
                        .stream()
                        .map(entry -> String.format("%s->[%s]", entry.getKey(), String.join(",", entry.getValue())))
                        .collect(joining(","))
        );
    }

    @PostMapping
    public ResponseEntity<Collection<BookingResponse>> createBookings(
            @RequestHeader HttpHeaders headers,
            @Valid @RequestBody List<CreateBookingRequest> requests
    ) {
        logHeaders(headers);

        List<Booking> toCreate = bookingMapper.createRequestToBookingList(requests);

        List<Booking> saved = bookingService.batchSave(toCreate);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bookingMapper.bookingToResponseList(saved));
    }

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
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        logHeaders(headers);

        // no filters -> we get all bookings (pagination included)
        boolean noFilters =
                bookingId == null &&
                        (status == null || status.isBlank()) &&
                        dateFrom == null &&
                        dateTo == null &&
                        userId == null;

        if (noFilters) {
            if (page == null || size == null) {
                return ResponseEntity.ok(bookingMapper.bookingToGetBookingResponseList(bookingService.getAll()));
            }
            return ResponseEntity.ok(bookingMapper.bookingToGetBookingResponseList(bookingService.getBookingsPage(page, size)));
        }
        //if no filers passed, so just '/bookings' -> we get all booking (including pagination)

        // Parse dates (ISO-8601 LocalDateTime, e.g. 2026-02-01T10:00:00)
        java.time.LocalDateTime from = (dateFrom == null || dateFrom.isBlank())
                ? null
                : java.time.LocalDateTime.parse(dateFrom);

        java.time.LocalDateTime to = (dateTo == null || dateTo.isBlank())
                ? null
                : java.time.LocalDateTime.parse(dateTo);

        BookingSearchCriteria criteria = new BookingSearchCriteria();
        criteria.setBookingId(bookingId);
        criteria.setStatus(status);
        criteria.setDateFrom(from);
        criteria.setDateTo(to);
        criteria.setUserId(userId);

        int p = page == null ? 0 : page;
        int s = size == null ? 10 : size;

        List<GetBookingResponse> result = bookingMapper.bookingToGetBookingResponseList(
                bookingService.search(criteria, p, s).getContent()
        );

        return ResponseEntity.ok(result);
    }


    @PutMapping(path = "/{bookingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateBooking(
            @RequestHeader HttpHeaders headers,
            @PathVariable Integer bookingId,
            @RequestBody UpdateBookingRequest updatedBooking
    ) {
        //only used in the admin panel
        logHeaders(headers);

        Booking existing = bookingService.getById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Booking with %d does not exist", bookingId)));

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
}
