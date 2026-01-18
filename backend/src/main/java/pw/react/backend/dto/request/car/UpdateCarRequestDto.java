package pw.react.backend.dto.request.car;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateCarRequestDto {
    @Valid
    @NotNull(message = "carFeatures is mandatory")
    @NotEmpty(message = "carFeatures cannot be empty")
    private List<CarFeatureDto> carFeatures;
}
