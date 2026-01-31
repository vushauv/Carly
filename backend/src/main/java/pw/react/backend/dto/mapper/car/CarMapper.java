package pw.react.backend.dto.mapper.car;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pw.react.backend.domain.car.Car;
import pw.react.backend.dto.mapper.car.image.CarImageUrlMapper;
import pw.react.backend.dto.request.car.CreateCarRequestDto;
import pw.react.backend.dto.request.car.UpdateCarRequestDto;
import pw.react.backend.dto.response.car.CreateCarResponseDto;
import pw.react.backend.dto.response.car.GetCarResponseDto;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CarMapper{
    private final CarFeatureMapper carFeatureMapper;
    private final CarImageUrlMapper carImageUrlMapper;

    // OUT mappings:
    public List<GetCarResponseDto> toGetResponseDtoList(List<Car> cars, Map<Integer, List<Integer>> imageUrlsByCarId)
    {
        if (cars == null || cars.isEmpty()) return List.of();

        return cars.stream()
                .map(car -> {
                    Integer carId = car.getCarId();
                    List<Integer> imageIds =
                            imageUrlsByCarId.getOrDefault(carId, List.of());

                    return toGetResponseDto(car, carId, imageIds);
                })
                .toList();
    }

    public GetCarResponseDto toGetResponseDto(Car car, int carId, List<Integer> imageIds)
    {
        var dto = new GetCarResponseDto();
        dto.setCarId(car.getCarId());
        dto.setPrice(car.getPrice());
        dto.setCarFeatures(carFeatureMapper.mapFeatureLinks(car.getFeatureLinks()));

        if(imageIds != null)
            dto.setUrls(imageIds.stream().map((imageId) -> carImageUrlMapper.mapUrl(carId, imageId))
                .toList());
        else
            dto.setUrls(List.of());

        return dto;
    }

    public CreateCarResponseDto toCreateResponseDto(Car car)
    {
        var dto = new CreateCarResponseDto();
        dto.setCarId(car.getCarId());
        return dto;
    }

    // IN Mappings:
    public Car fromUpdateCarRequestDto(UpdateCarRequestDto dto, int carId)
    {
        var car = new Car();
        var price = dto.getPrice();
        car.setCarId(carId);
        car.setPrice(price);
        return car;
    }

    public Car fromCreateCarRequestDto(CreateCarRequestDto dto)
    {
        var car = new Car();
        var price = dto.getPrice();
        car.setPrice(price);
        return car;
    }
}

