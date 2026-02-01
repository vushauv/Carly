package pw.react.backend.integrations.flatly.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class FlatlyPageResponse<T> {
    private List<T> content;
}
