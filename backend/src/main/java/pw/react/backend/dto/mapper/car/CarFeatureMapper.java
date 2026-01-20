package pw.react.backend.dto.mapper.car;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarFeatureDictionary;
import pw.react.backend.domain.enums.CarFeatureType;
import pw.react.backend.dto.request.car.CarFeatureDto;
import pw.react.backend.dto.request.car.CarFeatureFilters;
import pw.react.backend.dto.request.car.CarSearchParams;

import java.util.ArrayList;
import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CarFeatureMapper {
    // Out mappings:
    @Mapping(target = "dictionaryId", source = "dictionary.carFeatureDictionaryId")
    CarFeatureDto toCarFeatureDto(CarFeature carFeature);
    List<CarFeatureDto> toCarFeatureDtoList(List<CarFeature> carFeatures);

    // In mappings:
    @Mapping(target = "dictionary.carFeatureDictionaryId", source="dictionaryId")
    CarFeature toCarFeature(CarFeatureDto carFeatureDto);
    List<CarFeature> toCarFeatureList(List<CarFeatureDto> carFeatures);
}
