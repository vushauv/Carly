package pw.react.backend.dto.request.car;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Getter
@Setter
public class CreateCarRequestDto {
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
