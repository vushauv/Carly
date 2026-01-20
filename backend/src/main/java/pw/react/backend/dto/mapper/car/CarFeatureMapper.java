package pw.react.backend.dto.mapper.car;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarFeatureDictionary;
import pw.react.backend.dto.request.car.CarFeatureDto;
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


    default List<CarFeature> searchParamsToFeatureList(CarSearchParams searchParams) {
        if(searchParams == null) return List.of();

        // TODO: define global constants for things like "COLOR", "BRAND" etc.
        var carFeatures = new ArrayList<CarFeature>();
        var carFeatureFilters = searchParams.getCarFeatureFilters();
        addFeature(carFeatures, "COLOR", carFeatureFilters.getColor());
        addFeature(carFeatures, "BRAND", searchParams.getBrand());
        addFeature(carFeatures, "MODEL", searchParams.getModel());
        addFeature(carFeatures, "FUEL_TYPE", searchParams.getFuelType());
        addFeature(carFeatures, "STATUS", searchParams.getStatus());
    }

    private void addFeature(List<CarFeature> carFeatures, String dictName, String value)
    {
        var dictionary = new CarFeatureDictionary();
        dictionary.setName(dictName);
        var feature = new CarFeature();
        feature.setDictionary(dictionary);
        feature.setValue(value);
        carFeatures.add(feature);
    }
}
