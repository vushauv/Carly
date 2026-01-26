package pw.react.backend.dto.parkly;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.dto.request.car.CarFeatureDto;

import java.math.BigDecimal;
import java.util.List;

// For now this is exactly as GetCarResponseDto. However, this class
// was introduce to make the integration contract more flexible later on
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ParklyGetCarResponseDto
{
    private Integer carId;
    private List<CarFeatureDto> carFeatures;
    private List<String> urls;
}
