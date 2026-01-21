package pw.react.backend.dto.parkly;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParklyBookingResponse {
    private Integer bookingId;
    private String status;
}

