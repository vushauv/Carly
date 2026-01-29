package pw.react.backend.integrations.flatly.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FlatlyFlatImageDto {

    private Integer id;

    @JsonProperty("flat_id")
    private Integer flatId;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("sort_order")
    private Integer sortOrder;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
