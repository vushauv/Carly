package pw.react.backend.controller;


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
    //TODO: Implement searchCars so that it accepts certain parameters (optional?)
    //TODO (TBD): Decide whether Parkly has to provide our BookingId, or their BookingId!
    //TODO: Add validation for parkly by userId
    public static final String PARKLY_PATH = PathResolver.Parkly.Base;

    private final ParklyService parklyService;
    private final CarMainService carService;
    private final ParklyCarMapper parklyCarMapper;
    private final CarSearchCriteriaMapper carSearchCriteriaMapper;
    private final ParklyBookingMapper parklyBookingMapper;

    // TODO: fix parkly controller
    // Parkly integration for interacting with bookings
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

    @PostMapping(PathResolver.Parkly.CarBookings + "/{bookingId}/cancel")
    public void cancelCarBooking(@RequestHeader HttpHeaders headers,
                                @PathVariable Integer bookingId)
            throws AccessDeniedException
    {
        logHeaders(headers);
        parklyService.cancelCarBooking(bookingId);
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

