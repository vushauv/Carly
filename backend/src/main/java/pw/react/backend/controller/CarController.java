package pw.react.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.dto.request.car.CarFeatureDto;
import pw.react.backend.services.car.CarService;

import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(path = CarController.CAR_PATH)
@Slf4j
public class CarController {
    public static final String CAR_PATH = "/cars";

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @PostMapping(path="")
    public ResponseEntity<> createCar(@RequestHeader HttpHeaders headers,
                                      @RequestBody List<CarFeatureDto> carFeatures)
    {
        logHeaders(headers);
        List<CarFeature> requestedFeatures =
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
