package pw.react.backend.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.utils.JsonDateSerializer;

import java.time.LocalDateTime;

@Getter
@Setter
public class GetUserResponse {
    private long id;
    private String firstName;
    private String lastName;
    private String email;
    @JsonSerialize(using = JsonDateSerializer.class)
    private LocalDateTime dayOfBirth;
}
