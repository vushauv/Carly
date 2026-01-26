package pw.react.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pw.react.backend.controller.path.PathResolver;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarImage;
import pw.react.backend.dto.mapper.car.CarFeatureMapper;
import pw.react.backend.dto.mapper.car.CarImageMapper;
import pw.react.backend.dto.mapper.car.CarMapper;
import pw.react.backend.dto.mapper.car.CarSearchCriteriaMapper;
import pw.react.backend.dto.mapper.car.image.CarImageUrlMapper;
import pw.react.backend.dto.request.car.CarSearchParams;
import pw.react.backend.dto.request.car.CreateCarRequestDto;
import pw.react.backend.dto.request.car.UpdateCarRequestDto;
import pw.react.backend.dto.response.car.CarImageResponseDto;
import pw.react.backend.dto.response.car.CreateCarResponseDto;
import pw.react.backend.dto.response.car.GetCarImagesResponseDto;
import pw.react.backend.dto.response.car.GetCarResponseDto;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.services.car.CarImageService;
import pw.react.backend.services.car.CarService;
import java.util.ArrayList;
import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(path = CarController.CAR_PATH)
@RequiredArgsConstructor
@Slf4j
public class CarController {
    public static final String CAR_PATH = PathResolver.Car.Base;

    private final CarService carService;
    private final CarMapper carMapper;
    private final CarFeatureMapper carFeatureMapper;
    private final CarSearchCriteriaMapper carSearchCriteriaMapper;
    private final CarImageMapper carImageMapper;
    private final CarImageService carImageService;
    private final CarImageUrlMapper carImageUrlMapper;


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
                              @PathVariable Integer carId,
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
                                          @PathVariable Integer carId)
            throws ResourceNotFoundException
    {
        logHeaders(headers);
        carService.delete(carId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{carId}")
    public ResponseEntity<GetCarResponseDto> getCar(@RequestHeader HttpHeaders headers,
                                                    @PathVariable Integer carId)
            throws ResourceNotFoundException
    {
        logHeaders(headers);
        Car car = carService.getById(carId);
        var imageUrlsByCarId = carService.linkCarImages(List.of(car));
        return ResponseEntity.ok(carMapper.toGetResponseDto(car, carId, imageUrlsByCarId.get(carId)));
    }



    @GetMapping("")
    public ResponseEntity<List<GetCarResponseDto>> searchCars(@RequestHeader HttpHeaders headers,
                                                              @Valid @ModelAttribute CarSearchParams searchParams,
                                                              @RequestParam(required = false) Integer page,
                                                              @RequestParam(required = false) Integer size)
            throws BadRequestException
    {
        logHeaders(headers);

        var carSearchCriteria = carSearchCriteriaMapper.toCarSearchCriteria(searchParams);
        if (page == null) {
            var cars = carService.getAll(carSearchCriteria);
            var imageUrlsByCarId = carService.linkCarImages(cars);
            return ResponseEntity.ok(carMapper.toGetResponseDtoList(cars, imageUrlsByCarId));
        }
        var cars = carService.getPage(page,
                size == null ? 0 : size,
                carSearchCriteria);
        var imageUrlsByCarId = carService.linkCarImages(cars);
        return ResponseEntity.ok(carMapper.toGetResponseDtoList(cars, imageUrlsByCarId));
    }

    @GetMapping("/{carId}" + PathResolver.Car.Images)
    public ResponseEntity<GetCarImagesResponseDto> getCarImages(@RequestHeader HttpHeaders headers,
                                                                @PathVariable Integer carId)
    {
        logHeaders(headers);
        var images = carImageService.getAll(carId);

        // TODO: move this logic to the mapper. Add the possibility to retrieve GetCarImagesResponseDto together with GetCarResponseDto
        GetCarImagesResponseDto res = new GetCarImagesResponseDto();
        res.setImages(new ArrayList<>());

        List<CarImageResponseDto> dtos = carImageMapper.toCarImageResponseDtoList(images);
        for (var dto: dtos) {
            var fileDownloadUri = carImageUrlMapper.mapUrl(carId, dto.getImageId());
            dto.setFileUri(fileDownloadUri);
            res.getImages().add(dto);
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{carId}" + PathResolver.Car.Images + "/{imageId}")
    public ResponseEntity<Resource> getCarImage(@RequestHeader HttpHeaders headers,
                                                @PathVariable Integer carId,
                                                @PathVariable  Integer imageId)
    {
        logHeaders(headers);
        CarImage image = carImageService.getById(carId, imageId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + image.getFileName() + "\"")
                .body(new ByteArrayResource(image.getData()));
    }

    @DeleteMapping("/{carId}" + PathResolver.Car.Images + "/{imageId}")
    public void deleteCarImage(@RequestHeader HttpHeaders headers,
                               @PathVariable Integer carId,
                               @PathVariable Integer imageId)
    {
        logHeaders(headers);
        carImageService.delete(carId, imageId);
    }

    @PostMapping("/{carId}" + PathResolver.Car.Images)
    public ResponseEntity<CarImageResponseDto> uploadCarImage(@RequestHeader HttpHeaders headers,
                                                              @PathVariable Integer carId,
                                                              @RequestParam MultipartFile file)
    {
        logHeaders(headers);
        CarImage image =  carImageService.upload(file, carId);

        CarImageResponseDto res = carImageMapper.toCarImageResponseDto(image);
        var fileDownloadUri = carImageUrlMapper.mapUrl(carId, res.getImageId());

        res.setFileUri(fileDownloadUri);

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    private void logHeaders(HttpHeaders headers) {
        log.info("Controller request headers {}",
                headers.entrySet()
                        .stream()
                        .map(entry -> String.format("%s->[%s]", entry.getKey(), String.join(",", entry.getValue())))
                        .collect(joining(","))
        );
    }
}
