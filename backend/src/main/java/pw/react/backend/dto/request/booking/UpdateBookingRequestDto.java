package pw.react.backend.dto.request.booking;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.utils.JsonDateDeserializer;
import pw.react.backend.utils.JsonDateSerializer;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateBookingRequestDto {
    private Integer pickupLocationId;
    private Integer returnLocationId;

    private BookingStatus carBookingStatus;
    private BookingStatus flatBookingStatus;

    //we shouldn't update the PK of Flatly system, hence it shouldn't be contained in the UpdateBookingRequest
    //private Long providerExternalBookingId;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime carBookingDateFrom;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime carBookingDateTo;
}
