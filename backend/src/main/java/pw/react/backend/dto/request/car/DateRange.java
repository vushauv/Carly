package pw.react.backend.dto.request.car;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.utils.JsonDateDeserializer;
import pw.react.backend.utils.JsonDateSerializer;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class DateRange {
    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime from = LocalDate.now().atStartOfDay();

    @JsonDeserialize(using = JsonDateDeserializer.class)
    @JsonSerialize(using = JsonDateSerializer.class)
    @NotNull
    private LocalDateTime to;

    public DateRange(){}

    public DateRange(LocalDateTime from, LocalDateTime to) {
        this.from = from;
        this.to = to;
    }
}
