package pw.react.backend.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.controller.path.PathResolver;
import pw.react.backend.dto.mapper.car.CarSearchCriteriaMapper;
import pw.react.backend.dto.parkly.*;
import pw.react.backend.dto.mapper.parkly.ParklyCarMapper;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.services.car.CarMainService;
import pw.react.backend.services.parkly.ParklyService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(ParklyController.PARKLY_PATH)
@Slf4j
@RequiredArgsConstructor
public class ParklyController {
    //TODO: Implement searchCars so that it accepts certain parameters (optional?)
    //TODO (TBD): Decide whether Parkly has to provide our BookingId, or their BookingId!
    //TODO: Add validation for parkly by userId
    //return car details (images!) instead of only the CarId
    public static final String PARKLY_PATH = PathResolver.Parkly.Base;

    private final ParklyService parklyService;
    private final CarMainService carService;
    private final ParklyCarMapper parklyCarMapper;
    private final CarSearchCriteriaMapper carSearchCriteriaMapper;

    // Parkly integration for interacting with bookings
    @GetMapping(PathResolver.Parkly.CarBookings + "/{externalBookingId}")
    public ResponseEntity<ParklyBookingDetailsResponse> getCarBooking(
            @RequestHeader HttpHeaders headers,
            @PathVariable Integer externalBookingId
    ) {
        // TODO: externalBookingId caused an error when running code. Had to change it to accept Integer
        logHeaders(headers);
        return ResponseEntity.ok(parklyService.getCarBookingByExternalBookingId(externalBookingId));
    }

    @PostMapping(PathResolver.Parkly.CarBookings)
    public ResponseEntity<ParklyBookingResponse> createCarBooking(
            @RequestHeader HttpHeaders headers,
            @Valid @RequestBody ParklyCreateCarBookingRequest request
    ) {
        logHeaders(headers);
        ParklyBookingResponse response = parklyService.createCarBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping(PathResolver.Parkly.CarBookings + "/{externalBookingId}")
    public ResponseEntity<String> cancelCarBooking(
            @RequestHeader HttpHeaders headers,
            @PathVariable Integer externalBookingId
    ) {
        logHeaders(headers);

        boolean cancelled = parklyService.cancelCarBooking(externalBookingId);
        if (!cancelled) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(String.format("Booking with externalBookingId=%d not found for Parkly.", externalBookingId));
        }

        return ResponseEntity.ok(String.format("Booking with externalBookingId=%d cancelled.", externalBookingId));
    }

    // Parkly integration for retrieving cars
    @GetMapping(PathResolver.Parkly.Cars + "/{carId}")
    public ResponseEntity<ParklyGetCarResponseDto> getCar(@RequestHeader HttpHeaders headers,
                                                          @PathVariable Integer carId)
            throws ResourceNotFoundException
    {
        logHeaders(headers);

        var car = carService.getById(carId);
        var imageUrlsByCarId = carService.linkCarImages(List.of(car));
        return ResponseEntity.ok(parklyCarMapper.toGetResponseDto(car, carId, imageUrlsByCarId.get(carId)));
    }

    // SearchParams are the same
    @GetMapping(PathResolver.Parkly.Cars)
    public ResponseEntity<List<ParklyGetCarResponseDto>> searchCars(@RequestHeader HttpHeaders headers,
                                                                    @Valid @ModelAttribute ParklyCarSearchParams searchParams,
                                                                    @RequestParam(required = false) Integer page,
                                                                    @RequestParam(required = false) Integer size)
            throws BadRequestException
    {
        logHeaders(headers);

        // Checks if the date is valid
        var date = searchParams.getDate();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        if(date.getFrom().isBefore(todayStart)) date.setFrom(todayStart);

        var carSearchCriteria = carSearchCriteriaMapper.toCarSearchCriteria(searchParams);
        if (page == null) {
            var cars = carService.getAll(carSearchCriteria);
            var imageUrlsByCarId = carService.linkCarImages(cars);
            return ResponseEntity.ok(parklyCarMapper.toGetResponseDtoList(cars, imageUrlsByCarId));
        }
        var cars = carService.getPage(page,
                size == null ? 0 : size,
                carSearchCriteria);
        var imageUrlsByCarId = carService.linkCarImages(cars);
        return ResponseEntity.ok(parklyCarMapper.toGetResponseDtoList(cars, imageUrlsByCarId));
    }

    private void logHeaders(HttpHeaders headers) {
        log.info("Partner request headers {}",
                headers.entrySet().stream()
                        .map(e -> e.getKey() + "->[" + String.join(",", e.getValue()) + "]")
                        .collect(joining(","))
        );
    }
}

