package pw.react.backend.dto.request.car;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CarSearchParams {
    private CarFeatureFilters carFeatureFilters;
    private DateRange availability;
}

