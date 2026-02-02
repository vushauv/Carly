package pw.react.backend.integrations.flatly.dto.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class FlatlyCreateBookingRequest {

    private UUID flatId;

    private LocalDate checkInDate;

    private LocalDate checkOutDate;

    private Integer guestsCount;
}
