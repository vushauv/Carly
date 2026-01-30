package pw.react.backend.dto.mapper.car;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarToFeatureLink;
import pw.react.backend.dto.models.BookingStatusDto;
import pw.react.backend.dto.models.CarFeatureDto;
import pw.react.backend.utils.converters.out.DisplayNameConverter;

import java.util.List;
import java.util.Set;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CarFeatureMapper {
    // OUT mappings:
    @Mapping(target = "dictionaryId", source = "dictionary.carFeatureDictionaryId")
    @Mapping(target = "name", source = "dictionary.name", qualifiedByName = "toDisplayName")
    @Mapping(target = "value", source = "value", qualifiedByName = "toDisplayName")
    CarFeatureDto toCarFeatureDto(CarFeature carFeature);
    List<CarFeatureDto> toCarFeatureDtoList(List<CarFeature> carFeatures);

    // IN mappings:
    @Mapping(target = "dictionary.carFeatureDictionaryId", source="dictionaryId")
    CarFeature toCarFeature(CarFeatureDto carFeatureDto);
    List<CarFeature> toCarFeatureList(List<CarFeatureDto> carFeatures);

    // Helper methods:
    @Named("mapFeatureLinks")
    default List<CarFeatureDto> mapFeatureLinks(Set<CarToFeatureLink> featureLinks) {
        if (featureLinks == null || featureLinks.isEmpty()) return List.of();

        return featureLinks.stream()
                .map(CarToFeatureLink::getCarFeature)
                .map(this::toCarFeatureDto)
                .toList();
    }

    @Named("toDisplayName")
    default String toDisplayName(String name) {
        if (name == null) return null;
        return DisplayNameConverter.toDisplayName(name);
    }
}
