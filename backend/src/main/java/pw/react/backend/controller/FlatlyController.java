package pw.react.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.controller.path.PathResolver;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.dto.flatly.CreateFlatlyBookingRequest;
import pw.react.backend.dto.response.booking.BookingResponse;
import pw.react.backend.services.flatly.FlatlyService;
import pw.react.backend.integrations.flatly.dto.FlatlyFlatDto;
import java.util.List;
import java.time.LocalDateTime;
import pw.react.backend.integrations.flatly.dto.FlatlyBookingDto;


@RestController
@RequestMapping(FlatlyController.FLATLY_PATH)
@RequiredArgsConstructor
public class FlatlyController {

    public static final String FLATLY_PATH = PathResolver.Flatly.Base;
    private final FlatlyService flatlyService;
    
    @PostMapping(PathResolver.Flatly.Bookings)
    public ResponseEntity<BookingResponse> createFlatlyBooking(@Valid @RequestBody CreateFlatlyBookingRequest request) {
        Booking booking = flatlyService.createFlatBookingInFlatly(request);
        BookingResponse response = new BookingResponse();
        response.setId(booking.getProviderExternalBookingId()); //TODO: return our or Flatly's bookingId
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping(PathResolver.Flatly.Bookings + "/{bookingId}")
    public ResponseEntity<String> cancelFlatlyBooking(@PathVariable Integer bookingId) {
        if (flatlyService.cancelFlatBookingInFlatly(bookingId))
            return ResponseEntity.ok("Flatly booking cancelled for bookingId=" + bookingId);

        return ResponseEntity.ok("Flatly booking is already cancelled for bookingId=" + bookingId);
    }

    @GetMapping(PathResolver.Flatly.Flats + "/available")
    public ResponseEntity<List<FlatlyFlatDto>> getAvailableFlats(
            @RequestParam(name = "dateFrom") LocalDateTime dateFrom,
            @RequestParam(name = "dateTo") LocalDateTime dateTo
    ) {
        return ResponseEntity.ok(
                flatlyService.getAvailableBookings(dateFrom, dateTo)
        );
    }

    @GetMapping(PathResolver.Flatly.Flats + "/{flatId}")
    public ResponseEntity<FlatlyFlatDto> getFlatDetails(@PathVariable Integer flatId) {
        return ResponseEntity.ok(flatlyService.getFlatDetails(flatId));
    }

    @GetMapping( PathResolver.Flatly.FlatBookings + "/{flatBookingId}")
    public ResponseEntity<FlatlyBookingDto> getFlatBookingDetails(@PathVariable Integer flatBookingId) {
        return ResponseEntity.ok(flatlyService.getFlatBookingDetails(flatBookingId));
    }
}

