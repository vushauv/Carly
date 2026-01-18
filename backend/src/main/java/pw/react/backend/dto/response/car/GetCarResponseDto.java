package pw.react.backend.dto.response.car;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.dto.request.car.CarFeatureDto;

import java.util.List;

@Getter
@Setter
public class GetCarResponseDto
{
    private Integer carId;
    private List<CarFeatureDto> carFeatures;
}
