package pw.react.backend.integrations.flatly.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlatlyFlatLocationDto {
    private String country;
    private String city;
    private String addressLine;
    private String postalCode;
    private Double lat;
    private Double lng;
}
