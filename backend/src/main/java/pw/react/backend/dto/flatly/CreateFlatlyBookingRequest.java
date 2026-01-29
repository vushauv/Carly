package pw.react.backend.dto.flatly;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.utils.JsonDateDeserializer;
import pw.react.backend.utils.JsonDateSerializer;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateFlatlyBookingRequest {

    @NotNull(message = "User id is mandatory")
    private Integer userId;

    @NotNull(message = "Flat id is mandatory")
    private Integer flatId;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    @NotNull(message = "Date from is mandatory")
    private LocalDateTime dateFrom;

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    @NotNull(message = "Date to is mandatory")
    private LocalDateTime dateTo;

    //TODO: decide if we wanna prompt users for the guest count in the app, a default of 1 for now
    private Integer guestsCount = 1;

}

