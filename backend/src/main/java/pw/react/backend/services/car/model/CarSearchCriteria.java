package pw.react.backend.services.car.model;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.enums.CarAvailabilityStatus;
import pw.react.backend.dto.models.DateRange;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CarSearchCriteria {
    DateRange dateRange;
    List<CarFeature> carFeatures;
    CarAvailabilityStatus availabilityStatus;
    BigDecimal minPrice;
    BigDecimal maxPrice;
}
