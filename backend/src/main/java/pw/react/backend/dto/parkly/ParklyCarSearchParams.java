package pw.react.backend.dto.parkly;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.dto.request.car.CarFeatureFilters;
import pw.react.backend.dto.models.DateRange;

@Getter
@Setter
public class ParklyCarSearchParams {
    private CarFeatureFilters features;

    @Valid
    @NotNull
    private DateRange date;
}
