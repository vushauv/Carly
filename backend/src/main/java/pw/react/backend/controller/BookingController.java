package pw.react.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.dto.mapper.BookingMapper;
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

    @PostMapping(path = "")
    public ResponseEntity<Collection<BookingResponse>> createBookings(
            @RequestHeader HttpHeaders headers,
            @Valid @RequestBody List<CreateBookingRequest> bookings
    ) {
        logHeaders(headers);

        List<Booking> createdBookings = bookingMapper.createRequestToBookingList(bookings);
        List<Booking> saved = bookingService.batchSave(createdBookings);

        List<BookingResponse> result = bookingMapper.bookingToResponseList(saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
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
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        logHeaders(headers);

        if (page == null || size == null) {return ResponseEntity.ok(bookingMapper.bookingToGetBookingResponseList(bookingService.getAll()));
        }
        return ResponseEntity.ok(bookingMapper.bookingToGetBookingResponseList(bookingService.getBookingsPage(page, size)));
    }

    @PutMapping(path = "/{bookingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateBooking(
            @RequestHeader HttpHeaders headers,
            @PathVariable Integer bookingId,
            @RequestBody UpdateBookingRequest updatedBooking
    ) {
        logHeaders(headers);

        Booking existing = bookingService.getById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Booking with %d does not exist", bookingId)));

        // Merge only provided fields (non-null)
        bookingMapper.applyUpdate(updatedBooking, existing);
        log.info("After update: carBookingStatusId={}",
                existing.getCarBookingStatus() == null ? null : existing.getCarBookingStatus().getBookingStatusDictionaryId());

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
}
