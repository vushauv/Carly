package pw.react.backend.dto.request.user;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterUserRequest {
    @NotBlank(message = "First name is mandatory.")
    @Size(max=64)
    private String firstName;

    @Size(max=64)
    private String secondName;

    @NotBlank(message = "Last name is mandatory.")
    @Size(max=128)
    private String lastName;

    @NotBlank(message = "Email is mandatory.")
    @Email
    @Size(max=256)
    private String email;

    @NotBlank(message = "Password is mandatory.")
    @Size(min=6, max=128)
    private String password;

    private Long contactNumber;
}
