package pw.react.backend.integrations.flatly.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.utils.JsonDateDeserializer;
import pw.react.backend.utils.JsonDateSerializer;

import java.time.LocalDateTime;

@Getter
@Setter
public class FlatlyCreateBookingRequest {

    // we send the booking ID in our system to Flatly
    private Long bookingId;

    //the flat we wanna reserve
    private Integer flatId;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime dateFrom;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime dateTo;
}
