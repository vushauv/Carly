package pw.react.backend.integrations.flatly.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class FlatWithImagesDto {
    private UUID id;
    private String name;
    private String city;
    private String country;
    private Integer rooms;
    private Integer maxGuests;
    private BigDecimal lat;
    private BigDecimal lon;

    private List<FlatlyFlatImageDto> images;
}
