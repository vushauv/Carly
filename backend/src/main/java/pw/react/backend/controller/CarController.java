package pw.react.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
import pw.react.backend.exceptions.InvalidFileException;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.services.car.CarImageMainService;
import pw.react.backend.services.car.CarMainService;
import java.util.ArrayList;
import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(path = CarController.CAR_PATH)
@RequiredArgsConstructor
@Slf4j
public class CarController {
    public static final String CAR_PATH = PathResolver.Car.Base;

    private final CarMainService carService;
    private final CarMapper carMapper;
    private final CarFeatureMapper carFeatureMapper;
    private final CarSearchCriteriaMapper carSearchCriteriaMapper;
    private final CarImageMapper carImageMapper;
    private final CarImageMainService carImageService;
    private final CarImageUrlMapper carImageUrlMapper;


    @Operation(
            summary = "Create car",
            description = """
        - Creates a new car resource using the provided request body.
        - Feature values provided in `carFeatures` are validated and associated with the created car.
        - If a feature value does not yet exist in the system, it is created automatically.
        - If the feature already exists, the existing value is reused.
        - Each feature dictionary type may appear only once in the request, i.e. only one value per dictionaryId is allowed.
        - Returns identifier of the newly created car.
        """)
    @ApiResponse(responseCode = "201", description = "Car successfully created")
    @ApiResponse(responseCode = "400", description = "Invalid request parameters")
    @ApiResponse(responseCode = "404", description = "Referenced resource not found")
    @PostMapping(path="")
    public ResponseEntity<CreateCarResponseDto> createCar(@RequestHeader HttpHeaders headers,
                                                          @Valid @RequestBody CreateCarRequestDto createCarDto)
            throws BadRequestException, ResourceNotFoundException
    {
        logHeaders(headers);
        var requestedFeatures = carFeatureMapper.toCarFeatureList(createCarDto.getCarFeatures());
        var car = carMapper.fromCreateCarRequestDto(createCarDto);
        CreateCarResponseDto res = carMapper.toCreateResponseDto(carService.create(car,
                requestedFeatures));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }


    @Operation(
            summary = "Update car price and add/merge features",
            description = """
        Updates the car's price and merges provided features into the existing feature set.
        - `price` is mandatory and always updated.
        - `carFeatures` is optional. If provided, the server adds these features to the car's current features.
        - Existing features are preserved unless the same feature already exists, then it is merged.
        - The operation is idempotent under set semantics: sending the same request multiple times results in the same stored feature set.

        **Notes**
        - This endpoint does NOT replace the full Car resource representation.
        """
    )
    @PutMapping(path="/{carId}")
    public ResponseEntity<Void> updateCar(@RequestHeader HttpHeaders headers,
                              @PathVariable Integer carId,
                              @Valid @RequestBody UpdateCarRequestDto updateCarDto)
            throws BadRequestException, ResourceNotFoundException
    {
        logHeaders(headers);
        var requestedFeatures = carFeatureMapper.toCarFeatureList(updateCarDto.getCarFeatures());
        var car = carMapper.fromUpdateCarRequestDto(updateCarDto, carId);

        carService.update(car, requestedFeatures);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete car",
            description = """
        - Deletes a car identified by its ID.
        - Successful deletion returns no content.
        """)
    @ApiResponse(responseCode = "204", description = "Car successfully deleted")
    @ApiResponse(responseCode = "404", description = "Car not found")
    @DeleteMapping("/{carId}")
    public ResponseEntity<Void> deleteCar(@RequestHeader HttpHeaders headers,
                                          @PathVariable Integer carId)
            throws ResourceNotFoundException
    {
        logHeaders(headers);
        carService.delete(carId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get car by ID",
               description = """
        - Retrieves detailed information about a specific car by its identifier.
        The response includes car features, price,
        and associated image URLs.""")
    @ApiResponse(responseCode = "200", description = "Car successfully retrieved")
    @ApiResponse(responseCode = "404", description = "Car not found")
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

    @Operation(summary = "Search cars",
            description = """
        - Searches cars using optional filters provided as query parameters.
        - Supported filters include car features, availability status, booking date range,
        and price range.
        - Nested filter parameters are passed using dot notation.

        Example request:
        `/cars?date.to=2026-02-13T00:00:00&availability=rented&features.color=black`
        - The provided values are case-insentive

        **Filtering parameters**
        - `availability` — car availability status (default: AVAILABLE).
        - `date.from` — optional start of availability period.
          If omitted, it is assumed to be the start of the current day.
        - `date.to` — end of requested availability period.
        - `features.color` — filter by car color.
        - `features.brand` — filter by brand.
        - `features.model` — filter by model.
        - `features.fuelType` — filter by fuel type.
        - `features.status` — filter by vehicle status.
        - `minPrice` — minimum daily price (>= 0).
        - `maxPrice` — maximum daily price (>= 0).

        Pagination is optional:
        - If `page` is not provided, all matching cars are returned.
        - If `page` is provided, paginated results are returned.
        - `size` controls page size - optional

        **Notes**
        - All filters are optional.
        - Filters are combined using AND semantics.
        - Availability filtering checks booking overlaps for the given period.
        """
    )
    @ApiResponse(responseCode = "200", description = "Cars successfully retrieved")
    @ApiResponse(responseCode = "400", description = "Invalid search parameters")
    @ApiResponse(responseCode = "422", description = "Request cannot be processed due to semantic validation errors")
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

    @Operation(summary = "Get car images",
            description = """
        - Returns download URLs for each stored image.
        - Each entry in the list includes a URI that can be used to download the file.
        """)
    @ApiResponse(responseCode = "200", description = "Car images successfully retrieved")
    @ApiResponse(responseCode = "404", description = "Car not found")
    @GetMapping("/{carId}" + PathResolver.Car.Images)
    public ResponseEntity<GetCarImagesResponseDto> getCarImages(@RequestHeader HttpHeaders headers,
                                                                @PathVariable Integer carId)
            throws ResourceNotFoundException
    {
        logHeaders(headers);
        var images = carImageService.getAll(carId);

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

    @Operation(summary = "Get car image",
            description = """
        - Retrieves a specific image associated with a car.
        - Returns the binary image data with the appropriate content type and filename.
        """)
    @ApiResponse(responseCode = "200", description = "Car image successfully retrieved")
    @ApiResponse(responseCode = "404", description = "Car or image not found")
    @GetMapping("/{carId}" + PathResolver.Car.Images + "/{imageId}")
    public ResponseEntity<Resource> getCarImage(@RequestHeader HttpHeaders headers,
                                                @PathVariable Integer carId,
                                                @PathVariable  Integer imageId)
            throws ResourceNotFoundException
    {
        logHeaders(headers);
        CarImage image = carImageService.getById(carId, imageId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + image.getFileName() + "\"")
                .body(new ByteArrayResource(image.getData()));
    }

    @Operation(
            summary = "Delete car image",
            description = """
        - Deletes a specific image associated with a car.
        - Successful deletion returns no content.
        """)
    @ApiResponse(responseCode = "204", description = "Car image successfully deleted")
    @ApiResponse(responseCode = "404", description = "Car or image not found")
    @DeleteMapping("/{carId}" + PathResolver.Car.Images + "/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCarImage(@RequestHeader HttpHeaders headers,
                               @PathVariable Integer carId,
                               @PathVariable Integer imageId)
            throws ResourceNotFoundException
    {
        logHeaders(headers);
        carImageService.delete(carId, imageId);
    }

    @Operation(summary = "Upload car image",
            description = """
        - Uploads a new image for a specific car.
        - The image is stored and associated with the car.
        - Returns metadata and a download URI for the uploaded image.
        """)
    @ApiResponse(responseCode = "201", description = "Car image successfully uploaded")
    @ApiResponse(responseCode = "404", description = "Car not found or file invalid / not found")
    @ApiResponse(responseCode = "400", description = "Invalid request parameters")
    @ApiResponse(responseCode = "422", description = "Validation failed or file cannot be processed")
    @PostMapping("/{carId}" + PathResolver.Car.Images)
    public ResponseEntity<CarImageResponseDto> uploadCarImage(@RequestHeader HttpHeaders headers,
                                                              @PathVariable Integer carId,
                                                              @RequestParam MultipartFile file)
            throws ResourceNotFoundException, InvalidFileException
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
