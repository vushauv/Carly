package pw.react.backend.integrations.flatly.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class FlatlyFlatDto {
    private UUID id;
    private String name;
    private String city;
    private String country;
    private Integer rooms;

    @JsonProperty("maxGuests")
    private Integer maxGuests;

    private List<FlatlyFlatImageDto> images;
}
