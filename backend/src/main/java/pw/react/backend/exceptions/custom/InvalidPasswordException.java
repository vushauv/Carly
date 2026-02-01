package pw.react.backend.exceptions.custom;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException() { super("Invalid password"); }
}
