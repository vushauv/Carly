package pw.react.backend.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.dto.parkly.ParklyCreateCarBookingRequest;
import pw.react.backend.dto.parkly.ParklySearchCarsRequest;
import pw.react.backend.dto.parkly.ParklyBookingResponse;
import pw.react.backend.dto.parkly.ParklyCarResponse;
import pw.react.backend.dto.mapper.ParklyCarMapper;
import pw.react.backend.services.car.CarService;
import pw.react.backend.services.parkly.ParklyIntegrationService;

import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(ParklyController.PARKLY_PATH)
@Slf4j
@RequiredArgsConstructor
public class ParklyController {
    //TODO: Implement searchCars so that it accepts certain parameters (optional?)
    //return car details (images!) instead of only the CarId
    public static final String PARKLY_PATH = "/parkly";

    private final ParklyIntegrationService parklyIntegrationService;
    private final CarService carService;
    private final ParklyCarMapper parklyCarMapper;

    private void logHeaders(HttpHeaders headers) {
        log.info("Partner request headers {}",
                headers.entrySet().stream()
                        .map(e -> e.getKey() + "->[" + String.join(",", e.getValue()) + "]")
                        .collect(joining(","))
        );
    }

    @GetMapping("/cars")
    public ResponseEntity<List<ParklyCarResponse>> searchCars(
            @RequestHeader HttpHeaders headers,
            @Valid ParklySearchCarsRequest request
    ) {
        logHeaders(headers);
        // Reuse CarService to fetch cars (filtering by availability can be added later)
        var cars = carService.getAll();
        var responses = cars.stream()
                .map(parklyCarMapper::toParklyCarResponse)
                .toList();

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/car-bookings")
    public ResponseEntity<ParklyBookingResponse> createCarBooking(
            @RequestHeader HttpHeaders headers,
            @Valid @RequestBody ParklyCreateCarBookingRequest request
    ) {
        logHeaders(headers);
        ParklyBookingResponse response = parklyIntegrationService.createCarBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    //TODO (TBD): Decide whether Parkly has to provide our BookingId, or their BookingId!
    @DeleteMapping("/car-bookings/{externalBookingId}")
    public ResponseEntity<String> cancelCarBooking(
            @RequestHeader HttpHeaders headers,
            @PathVariable Long externalBookingId
    ) {
        logHeaders(headers);

        boolean cancelled = parklyIntegrationService.cancelCarBooking(externalBookingId);
        if (!cancelled) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(String.format("Booking with externalBookingId=%d not found for Parkly.", externalBookingId));
        }
        return ResponseEntity.ok(String.format("Booking with externalBookingId=%d cancelled.", externalBookingId));
    }
}

