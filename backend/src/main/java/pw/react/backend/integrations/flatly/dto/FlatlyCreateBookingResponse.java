package pw.react.backend.integrations.flatly.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlatlyCreateBookingResponse {
    private Integer id;   // Flatly booking identifier
    //we will determine the success/failure of creating a booking based on HTTP response code, but this may be useful for logging
    private String status;        // PENDING|CONFIRMED|CANCELLED|REJECTED
}

