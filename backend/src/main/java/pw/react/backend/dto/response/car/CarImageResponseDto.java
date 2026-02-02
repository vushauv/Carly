package pw.react.backend.dto.response.car;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CarImageResponseDto {
    private Integer imageId;
    private String fileUri;
    private String fileType;
    private Long fileSize;
}

