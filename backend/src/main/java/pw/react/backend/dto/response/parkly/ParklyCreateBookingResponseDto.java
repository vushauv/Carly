package pw.react.backend.dto.response.parkly;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.dto.models.BookingStatusDto;

import java.math.BigDecimal;

@Getter
@Setter
public class ParklyCreateBookingResponseDto {
    private Integer bookingId;
    private BookingStatusDto status;
    private BigDecimal totalPrice;
}

