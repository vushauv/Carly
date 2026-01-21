package pw.react.backend.dto.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pw.react.backend.domain.car.Car;
import pw.react.backend.dto.mapper.car.CarMapper;
import pw.react.backend.dto.parkly.ParklyCarResponse;
import pw.react.backend.repositories.car.CarImageRepository;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ParklyCarMapper {
    private final CarImageRepository carImageRepository;
    private final CarMapper carMapper;

    public ParklyCarResponse toParklyCarResponse(Car car) {
        var response = new ParklyCarResponse();
        response.setCarId(car.getCarId());

        // Map features using existing CarMapper logic
        var getCarDto = carMapper.toGetResponseDto(car);
        response.setCarFeatures(getCarDto.getCarFeatures());

        // Load image urls
        var images = carImageRepository.findByCar_CarId(car.getCarId());
        response.setImageUrls(images.stream().map(img -> img.getUrl()).collect(Collectors.toList()));
        return response;
    }
}
