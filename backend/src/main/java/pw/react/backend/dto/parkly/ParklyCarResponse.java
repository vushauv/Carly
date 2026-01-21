package pw.react.backend.dto.parkly;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.dto.request.car.CarFeatureDto;

import java.util.List;

@Getter
@Setter
public class ParklyCarResponse {
    //TODO (WSE): This is just carId for now, but realistically here we have to return all data that
    //parkly will need for displaying the Car in their system, so probably price, rating, images, and
    //possibly all features (TBD)
    private Integer carId;

    // Image URLs associated with the car
    private List<String> imageUrls;

    // Expose features if needed by Parkly UI
    private List<CarFeatureDto> carFeatures;
}

