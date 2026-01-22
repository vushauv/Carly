package pw.react.backend.integrations.flatly.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class FlatlyFlatDto {
    private Integer id;                // Flatly uses uuid per schema
    private String name;
    private String description;
    private String status;            // ACTIVE|INACTIVE per schema
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private FlatlyFlatLocationDto location;
    private FlatlyFlatSpecsDto specs;
    private List<FlatlyFlatImageDto> images;
    private List<FlatlyAmenityDto> amenities;
}
