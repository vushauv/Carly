package pw.react.backend.dto.request.booking;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.utils.JsonDateDeserializer;
import pw.react.backend.utils.JsonDateSerializer;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateBookingRequest {

    //we don't allow to change these 2
    //private Integer carId;
    //private Integer userId;

    private Integer pickupLocationId;
    private Integer returnLocationId;

    // TODO: this could be changed to accept enums
    private Short carBookingStatusId;
    private Short flatBookingStatusId;

    //we shouldn't update the PK of Flatly system, hence it shouldn't be contained in the UpdateBookingRequest
    //private Long providerExternalBookingId;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime carBookingDateFrom;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime carBookingDateTo;
}
