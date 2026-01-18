package pw.react.backend.dto.mapper.car;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarToFeatureLink;
import pw.react.backend.dto.request.car.CarFeatureDto;
import pw.react.backend.dto.response.car.CreateCarResponseDto;
import pw.react.backend.dto.response.car.GetCarResponseDto;

import java.util.List;
import java.util.Set;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = CarFeatureMapper.class)
public interface CarMapper {
    // Out mappings:
    List<GetCarResponseDto> toGetResponseDtoList(List<Car> cars);

    @Mapping(target = "carFeatures", source = "featureLinks", qualifiedByName = "mapFeatureLinks")
    GetCarResponseDto toGetResponseDto(Car car);

    @Named("mapFeatureLinks")
    default List<CarFeatureDto> mapFeatureLinks(Set<CarToFeatureLink> featureLinks) {
        if (featureLinks == null || featureLinks.isEmpty()) return List.of();

        return featureLinks.stream()
                .map(CarToFeatureLink::getCarFeature)
                .map(this::toCarFeatureDto)
                .toList();
    }

    @Mapping(target = "dictionaryId", source = "dictionary.carFeatureDictionaryId")
    CarFeatureDto toCarFeatureDto(CarFeature carFeature);

    CreateCarResponseDto toCreateResponseDto(Car car);

    // In mappings:

}
