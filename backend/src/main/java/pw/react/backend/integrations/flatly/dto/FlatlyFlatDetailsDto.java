package pw.react.backend.integrations.flatly.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class FlatlyFlatDetailsDto {

    private UUID id;
    private String name;
    private String city;
    private String country;
    private Integer rooms;
    private Integer maxGuests;
    private BigDecimal lat;
    private BigDecimal lon;
}
