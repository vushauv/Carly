package pw.react.backend.exceptions.custom;

public class EmailNotFoundException extends RuntimeException {
    public EmailNotFoundException() { super("Email not found"); }
}