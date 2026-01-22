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
import pw.react.backend.integrations.flatly.dto.FlatlyFlatDto;
import java.util.List;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import pw.react.backend.integrations.flatly.dto.FlatlyFlatDto;
import pw.react.backend.integrations.flatly.dto.FlatlyBookingDto;


@RestController
@RequestMapping(FlatlyController.FLATLY_PATH)
@RequiredArgsConstructor
public class FlatlyController {

    public static final String FLATLY_PATH = "/flatly";
    private final FlatlyService flatlyService;

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

    @GetMapping("/bookings/available")
    public ResponseEntity<List<FlatlyFlatDto>> getAvailableBookings(
            @RequestParam(name = "dateFrom") LocalDateTime dateFrom,
            @RequestParam(name = "dateTo") LocalDateTime dateTo
    ) {
        return ResponseEntity.ok(
                flatlyService.getAvailableBookings(dateFrom, dateTo)
        );
    }

    @GetMapping("/flats/{flatId}")
    public ResponseEntity<FlatlyFlatDto> getFlatDetails(@PathVariable Integer flatId) {
        return ResponseEntity.ok(flatlyService.getFlatDetails(flatId));
    }

    @GetMapping("/flat-bookings/{flatBookingId}")
    public ResponseEntity<FlatlyBookingDto> getFlatBookingDetails(@PathVariable Integer flatBookingId) {
        return ResponseEntity.ok(flatlyService.getFlatBookingDetails(flatBookingId));
    }

}

