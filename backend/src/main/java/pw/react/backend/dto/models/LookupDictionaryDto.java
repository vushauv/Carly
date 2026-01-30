package pw.react.backend.dto.models;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LookupDictionaryDto {
    private Short dictionaryId;
    private String name;
    private List<String> values;

    public LookupDictionaryDto(Short dictionaryId, String name, List<String> values) {
        this.dictionaryId = dictionaryId;
        this.name = name;
        this.values = values;
    }
}
