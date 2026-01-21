package pw.react.backend.dto.parkly;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class ParklyCarDetailsResponse {
    private Integer carId;
    private Map<String, String> features; // e.g. BRAND->BMW, MODEL->A4
    // add List<String> imageUrls; //TODO
}
