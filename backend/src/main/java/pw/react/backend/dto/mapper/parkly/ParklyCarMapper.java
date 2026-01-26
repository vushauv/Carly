package pw.react.backend.dto.mapper.parkly;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pw.react.backend.domain.car.Car;
import pw.react.backend.dto.mapper.car.CarFeatureMapper;
import pw.react.backend.dto.mapper.car.image.CarImageUrlMapper;
import pw.react.backend.dto.parkly.ParklyGetCarResponseDto;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ParklyCarMapper {
    private final CarFeatureMapper carFeatureMapper;
    private final CarImageUrlMapper carImageUrlMapper;

    // OUT mappings:
    public List<ParklyGetCarResponseDto> toGetResponseDtoList(List<Car> cars, Map<Integer, List<Integer>> imageUrlsByCarId)
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

    public ParklyGetCarResponseDto toGetResponseDto(Car car, int carId, List<Integer> imageIds)
    {
        var dto = new ParklyGetCarResponseDto();
        dto.setCarId(car.getCarId());

        dto.setCarFeatures(carFeatureMapper.mapFeatureLinks(car.getFeatureLinks()));
        dto.setUrls(imageIds.stream().map((imageId) -> carImageUrlMapper.mapUrl(carId, imageId))
                .toList());
        return dto;
    }
}
