package pw.react.backend.dto.response.booking;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateBookingResponseDto {
    private Integer id;
    private BigDecimal totalPrice;
}
