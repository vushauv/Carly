package pw.react.backend.utils.converters.request;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;
import pw.react.backend.domain.enums.ReferenceDataType;

import java.util.Arrays;
import java.util.stream.Collectors;

@Component
public class ReferenceDataTypeConverter
        implements Converter<String, ReferenceDataType> {
    @Override
    public ReferenceDataType convert(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }

        for (ReferenceDataType type : ReferenceDataType.values()) {
            if (type.name().equalsIgnoreCase(source)) {
                return type;
            }

            if (type.getValue().equalsIgnoreCase(source)) {
                return type;
            }
        }

        throw new IllegalArgumentException(
                "Invalid reference data type: " + Arrays.stream(ReferenceDataType.values())
                        .map(Enum::name).collect(Collectors.joining(",")));
    }
}
