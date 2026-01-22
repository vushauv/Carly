package pw.react.backend.integrations.flatly.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FlatlyFlatImageDto {
    private String id;
    private String url;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
