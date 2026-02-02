package pw.react.backend.integrations.flatly.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class FlatlyAvailableFlatDto {
    private UUID id;
    private String name;
    private String city;
    private String country;
    private Integer rooms;

    @JsonProperty("maxGuests")
    private Integer maxGuests;

    private BigDecimal lat;

    // API uses "lon" not "lng"
    private BigDecimal lon;
}