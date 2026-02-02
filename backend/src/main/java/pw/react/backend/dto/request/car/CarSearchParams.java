package pw.react.backend.dto.request.car;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.enums.CarAvailabilityStatus;
import pw.react.backend.dto.models.DateRange;

import java.math.BigDecimal;

@Getter
@Setter
public class CarSearchParams {
    private CarFeatureFilters features;
    // Will be resolved by Converter
    private CarAvailabilityStatus availability = CarAvailabilityStatus.AVAILABLE;
    @Valid
    private DateRange date;

    // Price range filters (optional)
    @DecimalMin(value = "0.0", inclusive = true, message = "minPrice must be >= 0")
    private BigDecimal minPrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "maxPrice must be >= 0")
    private BigDecimal maxPrice;
}

