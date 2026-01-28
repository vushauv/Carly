package pw.react.backend.dto.parkly;

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
public class ParklyCreateCarBookingRequest {

    // Parkly booking reference (for idempotency)
    @NotNull(message = "External booking id is mandatory")
    private Long externalBookingId;

    @NotNull(message = "Car id is mandatory")
    private Integer carId;

    private Integer pickupLocationId;
    private Integer returnLocationId;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    @NotNull(message = "Date from is mandatory")
    private LocalDateTime dateFrom;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    @NotNull(message = "Date to is mandatory")
    private LocalDateTime dateTo;
}

