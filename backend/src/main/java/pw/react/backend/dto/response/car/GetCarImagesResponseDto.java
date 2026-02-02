package pw.react.backend.dto.response.car;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class GetCarImagesResponseDto {
    List<CarImageResponseDto> images;
}
