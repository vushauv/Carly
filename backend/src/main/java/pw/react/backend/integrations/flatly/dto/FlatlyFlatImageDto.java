package pw.react.backend.integrations.flatly.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
public class FlatlyFlatImageDto {
    @JsonProperty("sort_order")
    private Integer sortOrder;

    @JsonProperty("image_url")
    private String imageUrl;
}
