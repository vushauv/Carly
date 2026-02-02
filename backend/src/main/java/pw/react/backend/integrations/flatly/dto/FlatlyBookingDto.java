package pw.react.backend.integrations.flatly.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class FlatlyBookingDto {
    private UUID id;
    private UUID flatId;
    private UUID userId;
    private String source;

    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guestsCount;
}
