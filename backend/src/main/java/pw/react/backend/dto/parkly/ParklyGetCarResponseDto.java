package pw.react.backend.dto.parkly;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.dto.request.car.CarFeatureDto;

import java.util.List;

// For now this is exactly as GetCarResponseDto. However, this class
// was introduce to make the integration contract more flexible later on
@Getter
@Setter
public class ParklyGetCarResponseDto
{
    private Integer carId;
    private List<CarFeatureDto> carFeatures;
}

// TODO: add List<String> urls for carImages to the DTO.
// TODO: the price of the car should be returned as pricePerDay * numberOfDays
