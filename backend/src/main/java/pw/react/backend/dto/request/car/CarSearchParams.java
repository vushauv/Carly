package pw.react.backend.dto.request.car;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.enums.CarAvailabilityStatus;
import pw.react.backend.dto.models.DateRange;

@Getter
@Setter
public class CarSearchParams {
    private CarFeatureFilters features;
    // Will be resolved by Converter
    private CarAvailabilityStatus availability = CarAvailabilityStatus.AVAILABLE;
    @Valid
    private DateRange date;

    // TODO: add possibility to filter by min/max price
}

