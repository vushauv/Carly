package pw.react.backend.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.dto.flatly.CreateFlatlyBookingRequest;
import pw.react.backend.dto.response.booking.BookingResponse;
import pw.react.backend.services.flatly.FlatlyService;

@RestController
@RequestMapping(FlatlyController.FLATLY_PATH)
@RequiredArgsConstructor
public class FlatlyController {

    public static final String FLATLY_PATH = "/flatly";
    private final FlatlyService flatlyService;

    //TODO:
    //1) Get all available bookings from their API
    //2) Get a specific booking from their API

    @PostMapping("/bookings")
    public ResponseEntity<BookingResponse> createFlatlyBooking(@Valid @RequestBody CreateFlatlyBookingRequest request) {
        Booking booking = flatlyService.createFlatBookingInFlatly(request);
        BookingResponse response = new BookingResponse();
        response.setId(booking.getProviderExternalBookingId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<String> cancelFlatlyBooking(@PathVariable Integer bookingId) {
        if (flatlyService.cancelFlatBookingInFlatly(bookingId))
            return ResponseEntity.ok("Flatly booking cancelled for bookingId=" + bookingId);

        return ResponseEntity.ok("Flatly booking is already cancelled for bookingId=" + bookingId);

    }
}

