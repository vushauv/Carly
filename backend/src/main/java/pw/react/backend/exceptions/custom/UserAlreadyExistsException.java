package pw.react.backend.exceptions.custom;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String email) {
        super("User already exists for email: " + email);
    }
}
