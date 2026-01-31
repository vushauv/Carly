package pw.react.backend.dto.request.parkly;

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
public class ParklyCreateBookingRequestDto {
    @NotNull(message = "CarId is mandatory")
    private Integer carId;

    private Integer pickupLocationId;
    private Integer returnLocationId;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    @NotNull(message = "CarBookingDateFrom is mandatory")
    private LocalDateTime carBookingDateFrom;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    @NotNull(message = "CarBookingDateTo is mandatory")
    private LocalDateTime carBookingDateTo;
}

