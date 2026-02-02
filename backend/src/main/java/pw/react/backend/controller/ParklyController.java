package pw.react.backend.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.controller.path.PathResolver;
import pw.react.backend.dto.mapper.car.CarSearchCriteriaMapper;
import pw.react.backend.dto.mapper.parkly.ParklyBookingMapper;
import pw.react.backend.dto.mapper.parkly.ParklyCarMapper;
import pw.react.backend.dto.request.parkly.ParklyCarSearchParams;
import pw.react.backend.dto.request.parkly.ParklyCreateBookingRequestDto;
import pw.react.backend.dto.response.parkly.ParklyGetBookingResponseDto;
import pw.react.backend.dto.response.parkly.ParklyCreateBookingResponseDto;
import pw.react.backend.dto.response.parkly.ParklyGetCarResponseDto;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.services.car.CarMainService;
import pw.react.backend.services.parkly.ParklyService;

import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(ParklyController.PARKLY_PATH)
@Slf4j
@RequiredArgsConstructor
public class ParklyController {
    public static final String PARKLY_PATH = PathResolver.Parkly.Base;
    private final ParklyService parklyService;
    private final CarMainService carService;
    private final ParklyCarMapper parklyCarMapper;
    private final CarSearchCriteriaMapper carSearchCriteriaMapper;
    private final ParklyBookingMapper parklyBookingMapper;

    // Parkly integration for interacting with bookings
    @Operation(summary = "Get car booking created from Parkly system",
            description = """
        - Retrieves details of a car booking created via Parkly integration.
        - The response includes booking status, rental period, locations,
          associated car, and total booking price.
        - Parkly can view only bookings created by their system.
        """)
    @ApiResponse(responseCode = "200",
            description = "Booking successfully retrieved",
            content = @Content(schema = @Schema(implementation = ParklyGetBookingResponseDto.class)))
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    @ApiResponse(responseCode = "422", description = "Request cannot be processed")
    @GetMapping(PathResolver.Parkly.CarBookings + "/{bookingId}")
    public ResponseEntity<ParklyGetBookingResponseDto> getCarBooking(@RequestHeader HttpHeaders headers,
                                                                     @PathVariable Integer bookingId)
            throws AccessDeniedException, ResourceNotFoundException
    {
        logHeaders(headers);
        var booking = parklyService.getBookingById(bookingId);
        var dto = parklyBookingMapper.toGetCarResponseDto(booking);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Create car booking from Parkly system",
            description = """
        - Creates a new car booking through Parkly integration.
        - Returns the created booking identifier, status, and calculated total price.
        """)
    @ApiResponse(
            responseCode = "201",
            description = "Booking successfully created",
            content = @Content(schema = @Schema(implementation = ParklyCreateBookingResponseDto.class))
    )
    @ApiResponse(responseCode = "400", description = "Invalid request parameters")
    @ApiResponse(responseCode = "404", description = "Referenced resource not found")
    @ApiResponse(responseCode = "422", description = "Validation failed or request cannot be processed")
    @PostMapping(PathResolver.Parkly.CarBookings)
    public ResponseEntity<ParklyCreateBookingResponseDto> createCarBooking(@RequestHeader HttpHeaders headers,
                                                                           @Valid @RequestBody ParklyCreateBookingRequestDto request)
            throws BadRequestException
    {
        logHeaders(headers);
        var booking = parklyBookingMapper.fromCreateBookingRequestDto(request);
        var res = parklyService.createCarBooking(booking);
        var dto = parklyBookingMapper.toCreateBookingResponseDto(res);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @Operation(
            summary = "Cancel Parkly car booking",
            description = """
        - Cancels an existing Parkly car booking by its identifier.
        - Successful cancellation returns no content.
        """)
    @ApiResponse(responseCode = "200", description = "Booking successfully cancelled")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    @PostMapping(PathResolver.Parkly.CarBookings + "/{bookingId}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelCarBooking(@RequestHeader HttpHeaders headers,
                                @PathVariable Integer bookingId)
            throws AccessDeniedException
    {
        logHeaders(headers);
        parklyService.cancelCarBooking(bookingId);
    }

    // Parkly integration for retrieving cars
    @Operation(summary = "Get car by ID",
            description = """
        - Retrieves car details for Parkly integration.
        - The response includes car features, daily price, and URLs of associated images.
        """)
    @ApiResponse(
            responseCode = "200",
            description = "Car successfully retrieved",
            content = @Content(schema = @Schema(implementation = ParklyGetCarResponseDto.class))
    )
    @ApiResponse(responseCode = "404", description = "Car not found")
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

    @Operation(summary = "Search cars",
            description = """
        - Searches cars using filters provided as query parameters.
        - Supported filters include booking date range and optional car features.
        - Nested filter parameters are passed using dot notation.

        Example request:
        `/parkly/cars?date.from=2026-02-10T00:00:00&date.to=2026-02-13T00:00:00&features.color=black`

        **Filtering parameters**
        - `date.from` — optional start of availability period (start of the current day is chosen by default).
        - `date.to` — required end of availability period.
        - `features.color` — filter by car color.
        - `features.brand` — filter by brand.
        - `features.model` — filter by model.
        - `features.fuelType` — filter by fuel type.
        - `features.status` — filter by vehicle status.

        Pagination is optional:
        - If `page` is not provided, all matching cars are returned.
        - If `page` is provided, paginated results are returned.
        - `size` controls page size (optional).

        **Notes**
        - Only cars available in the requested period are returned.
        - Feature filters are optional.
        - Filters are combined using AND semantics.
        - Availability filtering checks booking overlaps for the given period.
        """)
    @ApiResponse(
            responseCode = "200",
            description = "Cars successfully retrieved",
            content = @Content(schema = @Schema(implementation = ParklyGetCarResponseDto.class))
    )
    @ApiResponse(responseCode = "400", description = "Invalid search parameters")
    @ApiResponse(responseCode = "422", description = "Request cannot be processed due to validation errors")
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

