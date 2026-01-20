package pw.react.backend.services.car.model;

import pw.react.backend.domain.enums.CarAvailabilityStatus;
import pw.react.backend.dto.request.car.CarFeatureFilters;
import pw.react.backend.dto.request.car.DateRange;

import java.util.List;

public class CarSearchCriteria {
    DateRange dateRange;
    List<CarFeatureFilters> carFeatureFilters;
    CarAvailabilityStatus availabilityStatus;
}
