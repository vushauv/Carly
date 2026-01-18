package pw.react.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginUserRequest {

    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String password;
}
