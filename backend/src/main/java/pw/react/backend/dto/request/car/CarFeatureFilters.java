package pw.react.backend.dto.request.car;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CarFeatureFilters {
    private String color;
    private String brand;
    private String model;
    private String fuelType;
    private String status;
}
