package pw.react.backend.integrations.flatly.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlatlyFlatSpecsDto {
    private Integer rooms;
    private Integer beds;
    private Integer bathrooms;
    private Integer floor;
    private Double areaSqm;
    private Integer maxGuests;
}
