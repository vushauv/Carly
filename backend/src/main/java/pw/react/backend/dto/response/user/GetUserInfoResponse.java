package pw.react.backend.dto.response.user;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetUserInfoResponse {
    private Long userId;
    private String firstName;
    private String secondName;
    private String lastName;
    private String email;
    private Long contactNumber;
}