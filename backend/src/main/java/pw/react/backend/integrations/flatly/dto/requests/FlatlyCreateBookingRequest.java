package pw.react.backend.integrations.flatly.dto.requests;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.utils.JsonDateDeserializer;
import pw.react.backend.utils.JsonDateSerializer;

import java.time.LocalDateTime;

@Getter
@Setter
public class FlatlyCreateBookingRequest {

    //the flat we wanna reserve
    private Integer flatId;

    //the BookingId in our system is kept in flatly as partner_booking_ref
    private Integer partnerBookingRef;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime dateFrom;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime dateTo;

    //TODO: rest of the stuff they keep will have to be populated by their system
    //so we don't send price_total, created_by_system, created_via etc..
    //we don't send the id of Carly in their system, they should handle that themselves
}
