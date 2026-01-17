package pw.react.backend.dto.response;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetUserResponse {
    private Long userId;
    private String firstName;
    private String secondName;
    private String lastName;
    private String email;
}