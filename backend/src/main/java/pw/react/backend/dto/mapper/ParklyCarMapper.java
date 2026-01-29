package pw.react.backend.dto.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.car.Car;
import pw.react.backend.dto.mapper.car.CarFeatureMapper;
import pw.react.backend.dto.parkly.ParklyGetCarResponseDto;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = CarFeatureMapper.class
)
public interface ParklyCarMapper {
    // OUT mappings:
    List<ParklyGetCarResponseDto> toParklyGetResponseDtoList(List<Car> cars);

    @Mapping(target = "carFeatures", source = "featureLinks", qualifiedByName = "mapFeatureLinks")
    ParklyGetCarResponseDto toParklyGetResponseDto(Car car);
}
