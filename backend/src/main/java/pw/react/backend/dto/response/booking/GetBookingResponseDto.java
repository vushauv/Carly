package pw.react.backend.dto.response.booking;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.dto.models.BookingStatusDto;
import pw.react.backend.dto.models.LocationDto;
import pw.react.backend.utils.JsonDateDeserializer;
import pw.react.backend.utils.JsonDateSerializer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class GetBookingResponseDto {
    private Integer id;

    private Integer userId;
    private Integer carId;

    private LocationDto pickupLocation;
    private LocationDto returnLocation;

    private BookingStatusDto carStatus;
    private BookingStatusDto flatStatus;

    private UUID providerExternalBookingId;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime carBookingDateFrom;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime carBookingDateTo;

    private BigDecimal totalPrice;
}

