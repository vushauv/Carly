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

    // Optional updates (nullable means "do not change")
    private Integer carId;
    private Integer pickupLocationId;
    private Integer returnLocationId;

    private Short carBookingStatusId;
    private Short flatBookingStatusId;

    private Long providerExternalBookingId;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime carBookingDateFrom;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime carBookingDateTo;
}
