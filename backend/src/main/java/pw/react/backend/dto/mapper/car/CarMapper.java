package pw.react.backend.dto.mapper.car;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.car.Car;
import pw.react.backend.dto.response.car.CreateCarResponseDto;
import pw.react.backend.dto.response.car.GetCarResponseDto;

import java.util.List;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = CarFeatureMapper.class
)
public interface CarMapper {
    // OUT mappings:
    List<GetCarResponseDto> toGetResponseDtoList(List<Car> cars);

    // Will implicitly use CarFeatureMapper
    @Mapping(target = "carFeatures", source = "featureLinks", qualifiedByName = "mapFeatureLinks")
    GetCarResponseDto toGetResponseDto(Car car);

    CreateCarResponseDto toCreateResponseDto(Car car);

    // IN mappings:
}
