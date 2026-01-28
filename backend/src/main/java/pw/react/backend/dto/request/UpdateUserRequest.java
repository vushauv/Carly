package pw.react.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UpdateUserRequest {
    @Size(max = 64)
    private String firstName;

    @Size(max = 64)
    private String secondName;

    @Size(max = 128)
    private String lastName;

    @Email
    @Size(max = 256)
    private String email;

    @Size(min = 6, max = 128)
    private String password;

    private Long contactNumber;

}
