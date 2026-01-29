package pw.react.backend.integrations.flatly.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class FlatlyFlatDto {

    private Integer id;
    private String name;
    private String description;
    private String status;

    private String country;
    private String city;

    @JsonProperty("address_line")
    private String addressLine;

    @JsonProperty("postal_code")
    private String postalCode;

    // schema has POINT location; without knowing their JSON shape,
    // safest is to accept it as String for now (e.g. "POINT(lng lat)")
    private String location;

    private Integer rooms;
    private Integer beds;
    private Integer bathrooms;
    private Integer floor;

    @JsonProperty("area_sqm")
    private BigDecimal areaSqm;

    @JsonProperty("max_guests")
    private Integer maxGuests;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    private List<FlatlyFlatImageDto> images;
    private List<FlatlyAmenityDto> amenities;
    private List<FlatlyPricingRuleDto> pricing;
}
