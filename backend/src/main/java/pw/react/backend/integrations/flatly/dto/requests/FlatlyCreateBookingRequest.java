package pw.react.backend.integrations.flatly.dto.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FlatlyCreateBookingRequest {

    private Integer flatId;

    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;

    private Integer guestsCount;

    @JsonProperty("source_ref")
    private Integer sourceRef; // our bookingId
}
