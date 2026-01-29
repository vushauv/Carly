package pw.react.backend.dto.request.car;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.enums.CarAvailabilityStatus;

@Getter
@Setter
public class CarSearchParams {
    private CarFeatureFilters features;
    private DateRange date;
    // Will be resolved by Converter
    private CarAvailabilityStatus availability;
}

