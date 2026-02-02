package pw.react.backend.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.controller.path.PathResolver;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.dto.request.flatly.CreateFlatlyBookingRequest;
import pw.react.backend.dto.request.flatly.CreateFlatlyBookingResponse;
import pw.react.backend.integrations.flatly.dto.responses.FlatlyBookingDetailsResponse;
import pw.react.backend.integrations.flatly.dto.responses.FlatlyBookingDetailsExtendedResponse;
import pw.react.backend.integrations.flatly.dto.FlatlyFlatDto;
import pw.react.backend.services.flatly.FlatlyService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(FlatlyController.FLATLY_PATH)
@RequiredArgsConstructor
public class FlatlyController {

    public static final String FLATLY_PATH = PathResolver.Flatly.Base;

    private final FlatlyService flatlyService;

    @GetMapping(PathResolver.Flatly.Flats + "/available")
    public ResponseEntity<List<FlatlyFlatDto>> getAvailableFlats(
            @RequestParam(name = "dateFrom") LocalDateTime dateFrom,
            @RequestParam(name = "dateTo") LocalDateTime dateTo
    ) {
        return ResponseEntity.ok(flatlyService.getAvailableFlatsWithImages(dateFrom, dateTo));
    }

    @PostMapping(PathResolver.Flatly.Bookings)
    public ResponseEntity<CreateFlatlyBookingResponse> createFlatlyBooking(@Valid @RequestBody CreateFlatlyBookingRequest request) {
        Booking booking = flatlyService.createFlatBookingInFlatly(request);

        CreateFlatlyBookingResponse response = new CreateFlatlyBookingResponse();
        response.setId(booking.getProviderExternalBookingId()); // UUID
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(PathResolver.Flatly.FlatBookings + "/{flatBookingId}")
    public ResponseEntity<FlatlyBookingDetailsResponse> getFlatBookingDetails(@PathVariable UUID flatBookingId) {
        return ResponseEntity.ok(flatlyService.getFlatBookingDetailsWithImages(flatBookingId));
    }

    @GetMapping(PathResolver.Flatly.FlatBookings + "/user/{userId}")
    public ResponseEntity<List<FlatlyBookingDetailsResponse>> getUserFlatBookings(@PathVariable Integer userId) {
        return ResponseEntity.ok(flatlyService.getUserFlatBookings(userId));
    }

    // download all Flatly partner bookings (providerExternalBookingId is not null)
    @GetMapping(PathResolver.Flatly.FlatBookings)
    public ResponseEntity<List<FlatlyBookingDetailsExtendedResponse>> getAllFlatBookings(
            @RequestParam(required = false) @Min(0) Integer page,
            @RequestParam(required = false) @Min(1) Integer size
    ) {
        if (page == null || size == null) {
            return ResponseEntity.ok(flatlyService.getAllFlatBookings());
        }
        return ResponseEntity.ok(flatlyService.getAllFlatBookings(page, size));
    }

    @DeleteMapping(PathResolver.Flatly.Bookings + "/{flatBookingId}")
    public ResponseEntity<String> cancelFlatlyBooking(@PathVariable UUID flatBookingId) {
        if (flatlyService.cancelFlatBookingInFlatly(flatBookingId)) {
            return ResponseEntity.ok("Flatly booking cancelled for flatBookingId=" + flatBookingId);
        }
        return ResponseEntity.ok("Flatly booking is already cancelled for flatBookingId=" + flatBookingId);
    }
}
