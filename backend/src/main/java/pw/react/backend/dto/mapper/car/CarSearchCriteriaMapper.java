package pw.react.backend.dto.mapper.car;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarFeatureDictionary;
import pw.react.backend.domain.enums.CarFeatureType;
import pw.react.backend.dto.request.car.CarFeatureFilters;
import pw.react.backend.dto.request.car.CarSearchParams;
import pw.react.backend.services.car.model.CarSearchCriteria;

import java.util.ArrayList;
import java.util.List;

// TODO: implement mapper
@Mapper(unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface CarSearchCriteriaMapper {
    // IN:

    @Mapping(target = "carFeatures",
            source = "features")
    @Mapping(target = "dateRange",
            source = "date")
    @Mapping(target = "availabilityStatus",
            source = "availability")
    CarSearchCriteria toCarSearchCriteria(CarSearchParams carSearchParams);

    default List<CarFeature> searchParamsToFeatureList(CarFeatureFilters featureFilters) {
        if(featureFilters == null) return List.of();

        var carFeatures = new ArrayList<CarFeature>();
        addFeature(carFeatures, CarFeatureType.COLOR.name(), featureFilters.getColor());
        addFeature(carFeatures, CarFeatureType.BRAND.name(), featureFilters.getBrand());
        addFeature(carFeatures, CarFeatureType.MODEL.name(), featureFilters.getModel());
        addFeature(carFeatures, CarFeatureType.FUEL_TYPE.name(), featureFilters.getFuelType());
        addFeature(carFeatures, CarFeatureType.STATUS.name(), featureFilters.getStatus());

        return carFeatures;
    }

    private void addFeature(List<CarFeature> carFeatures, String dictName, String value)
    {
        // If the value is not provided - do not include it in the list
        if(value == null) return;

        var dictionary = new CarFeatureDictionary();
        dictionary.setName(dictName);
        var feature = new CarFeature();
        feature.setDictionary(dictionary);
        feature.setValue(value);
        carFeatures.add(feature);
    }
}
