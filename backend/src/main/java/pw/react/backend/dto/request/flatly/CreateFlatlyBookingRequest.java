package pw.react.backend.dto.request.flatly;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateFlatlyBookingRequest {

    @NotNull(message = "User id is mandatory")
    private Integer userId;

    @NotNull(message = "Flat id is mandatory")
    private UUID flatId;

    @NotNull
    private LocalDate checkInDate;

    @NotNull
    private LocalDate checkOutDate;

    @NotNull(message = "Guest count is mandatory")
    @Min(1)
    private Integer guestsCount;

}

