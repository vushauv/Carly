package pw.react.backend.dto.response.parkly;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.dto.models.BookingStatusDto;

@Getter
@Setter
public class ParklyCreateBookingResponseDto {
    private Integer bookingId;
    private BookingStatusDto status;
}

