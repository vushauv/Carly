package pw.react.backend.dto.request.flatly;

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

    @NotNull(message = "Guests count is mandatory")
    private Integer guestsCount;

}

