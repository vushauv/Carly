package pw.react.backend.dto.request.car;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.dto.models.BookingStatusDto;
import pw.react.backend.dto.models.CarFeatureDto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Getter
@Setter
public class UpdateCarRequestDto {
    @Valid
    @NotNull(message = "carFeatures is mandatory")
    @NotEmpty(message = "carFeatures cannot be empty")
    private List<CarFeatureDto> carFeatures;

    @NotNull(message = "price is mandatory")
    @DecimalMin(value = "0.0", inclusive = true, message = "price must be >= 0")
    private BigDecimal price;

    public void setPrice(BigDecimal price) {
        this.price = price.setScale(2, RoundingMode.HALF_UP);
    }
}
