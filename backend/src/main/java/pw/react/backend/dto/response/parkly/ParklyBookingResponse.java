package pw.react.backend.dto.response.parkly;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParklyBookingResponse {
    private Integer bookingId;
    private String status;
}

