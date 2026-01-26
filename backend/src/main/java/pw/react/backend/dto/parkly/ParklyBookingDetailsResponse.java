package pw.react.backend.dto.parkly;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ParklyBookingDetailsResponse {

    private Integer bookingId;
    private Long externalBookingId;
    private String status;

    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;


    private ParklyGetCarResponseDto car;
}
