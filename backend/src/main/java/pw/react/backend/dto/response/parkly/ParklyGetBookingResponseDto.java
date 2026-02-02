package pw.react.backend.dto.response.parkly;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.dto.models.BookingStatusDto;
import pw.react.backend.dto.models.LocationDto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ParklyGetBookingResponseDto {
    private Integer bookingId;
    private BookingStatusDto status;

    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;

    private LocationDto pickupLocation;
    private LocationDto returnLocation;

    private Integer carId;
    private BigDecimal totalPrice;
}
