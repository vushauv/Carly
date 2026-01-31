package pw.react.backend.dto.mapper.reference;

import org.springframework.stereotype.Component;
import pw.react.backend.dto.models.LookupDictionaryDto;
import pw.react.backend.dto.response.reference.LookUpDictionaryKey;
import pw.react.backend.dto.response.reference.ReferenceDataDto;
import pw.react.backend.repositories.car.models.CarFeatureDictionaryRow;
import pw.react.backend.utils.converters.response.DisplayNameConverter;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReferenceDataMapper {
    public ReferenceDataDto addLookupLink(ReferenceDataDto dto, List<CarFeatureDictionaryRow> rows)
    {
        var grouped = rows.stream()
                        .collect(Collectors.groupingBy(
                                row -> new LookUpDictionaryKey(row.getDictionaryId(),
                                        row.getName())));

        for (var entry : grouped.entrySet()) {
            dto.getReferenceData().add(
                   this.lookupDictionaryDto(entry.getKey(), entry.getValue())
            );
        }

        return dto;
    }

    private LookupDictionaryDto lookupDictionaryDto(LookUpDictionaryKey key,
                                                   List<CarFeatureDictionaryRow> rows)
    {
        List<String> values = rows.stream()
                .map(row -> DisplayNameConverter.toDisplayName(row.getValue()))
                .toList();

        return new LookupDictionaryDto(
                key.id(),
                DisplayNameConverter.toDisplayName(key.name()),
                values
        );
    }
}
