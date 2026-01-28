package pw.react.backend.integrations.flatly.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlatlyCreateBookingResponse {
    private Long flatBookingId;   // Flatly booking identifier
    private String status;        // CREATED/CONFIRMED, etc.
}

