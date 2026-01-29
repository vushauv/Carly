package pw.react.backend.integrations.flatly.dto.responses;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlatlyCreateBookingResponse {
    private Integer id;
    private String status; // Flatly's internal status - for logging
}

