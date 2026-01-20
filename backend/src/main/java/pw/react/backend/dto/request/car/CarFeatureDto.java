package pw.react.backend.dto.request.car;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class CarFeatureDto {
    @NotNull(message = "DictionaryId is mandatory")
    private Short dictionaryId;
    @NotBlank(message = "Value is mandatory")
    private String value;
}
