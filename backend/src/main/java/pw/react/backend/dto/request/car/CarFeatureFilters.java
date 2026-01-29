package pw.react.backend.dto.request.car;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CarFeatureFilters {
    private String color;
    private String brand;
    private String model;
    // TODO: To be discussed - possibly change these to enums to enforce only a finite set of values.
    //  Then create coverterFactory for them.
    private String fuelType;
    private String status;
    // to be added
}
