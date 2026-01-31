package pw.react.backend.utils.converters.request;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;
import pw.react.backend.domain.enums.CarAvailabilityStatus;

import java.util.Arrays;
import java.util.stream.Collectors;

// Is used to convert incoming strings to CarAvailabilityStatus enum
// Applied only for RequestParam and PathVariable
@Component
public class CarAvailabilityStatusConverter
implements Converter<String, CarAvailabilityStatus> {
    @Override
    public CarAvailabilityStatus convert(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        var normalised = value.trim().toUpperCase();

        try {
            return CarAvailabilityStatus.valueOf(normalised);
        } catch (IllegalArgumentException ex) {
            String allowed = Arrays.stream(CarAvailabilityStatus.values())
                    .map(Enum::name).collect(Collectors.joining(","));

            throw new IllegalArgumentException(
                    String.format("Invalid availability status '%s'. Allowed values: %s", value, allowed),
                    ex
            );
        }
    }
}
