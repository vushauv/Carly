package pw.react.backend.dto.request.booking;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.enums.BookingStatus;

import java.time.LocalDateTime;

@Getter
@Setter
public class BookingSearchCriteria {
    private Integer bookingId;
    private BookingStatus status; // e.g. CREATED/CANCELLED/COMPLETED
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private Integer userId;
}
