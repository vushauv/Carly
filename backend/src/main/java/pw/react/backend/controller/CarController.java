package pw.react.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.dto.mapper.car.CarFeatureMapper;
import pw.react.backend.dto.mapper.car.CarMapper;
import pw.react.backend.dto.request.car.CarSearchParams;
import pw.react.backend.dto.request.car.CreateCarRequestDto;
import pw.react.backend.dto.request.car.UpdateCarRequestDto;
import pw.react.backend.dto.response.car.CreateCarResponseDto;
import pw.react.backend.dto.response.car.GetCarResponseDto;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.services.car.CarService;

import java.time.LocalDateTime;
import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(path = CarController.CAR_PATH)
@RequiredArgsConstructor
@Slf4j
public class CarController {
    public static final String CAR_PATH = "/cars";

    private final CarService carService;
    private final CarMapper carMapper;
    private final CarFeatureMapper carFeatureMapper;

    @PostMapping(path="")
    public ResponseEntity<CreateCarResponseDto> createCar(@RequestHeader HttpHeaders headers,
                                                          @Valid @RequestBody CreateCarRequestDto  createCarDto)
            throws BadRequestException, ResourceNotFoundException
    {
        logHeaders(headers);
        List<CarFeature> requestedFeatures = carFeatureMapper.toCarFeatureList(createCarDto.getCarFeatures());
        CreateCarResponseDto res = carMapper.toCreateResponseDto(carService.create(requestedFeatures));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PatchMapping(path="/{carId}")
    public ResponseEntity<Void> updateCar(@RequestHeader HttpHeaders headers,
                              @PathVariable("carId") Integer carId,
                              @Valid @RequestBody UpdateCarRequestDto updateCarDto)
            throws BadRequestException, ResourceNotFoundException
    {
        logHeaders(headers);
        List<CarFeature> requestedFeatures = carFeatureMapper.toCarFeatureList(updateCarDto.getCarFeatures());
        carService.update(carId, requestedFeatures);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{carId}")
    public ResponseEntity<Void> deleteCar(@RequestHeader HttpHeaders headers,
                                          @PathVariable("carId") Integer carId)
            throws ResourceNotFoundException
    {
        logHeaders(headers);
        carService.delete(carId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{carId}")
    public ResponseEntity<GetCarResponseDto> getCar(@RequestHeader HttpHeaders headers,
                                                    @PathVariable("carId") Integer id)
            throws ResourceNotFoundException
    {
        logHeaders(headers);
        Car car = carService.getById(id);
        return ResponseEntity.ok(carMapper.toGetResponseDto(car));
    }

    // TODO: introduce mapping to domain object here
    @GetMapping("")
    public ResponseEntity<List<GetCarResponseDto>> getAllCars(@RequestHeader HttpHeaders headers,
                                                              @ModelAttribute CarSearchParams searchParams,
                                                              @RequestParam(required = false) Integer page,
                                                              @RequestParam(required = false) Integer size)
    {
        logHeaders(headers);
        if (page == null) {
            return ResponseEntity.ok(carMapper.toGetResponseDtoList(carService.getAll()));
        }
        return ResponseEntity.ok(carMapper.toGetResponseDtoList(carService.getPage(page, size == null ? 0 : size,)));
    }

    private void logHeaders(@RequestHeader HttpHeaders headers) {
        log.info("Controller request headers {}",
                headers.entrySet()
                        .stream()
                        .map(entry -> String.format("%s->[%s]", entry.getKey(), String.join(",", entry.getValue())))
                        .collect(joining(","))
        );
    }
}
