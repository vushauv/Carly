package pw.react.backend.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.NoHandlerFoundException;
import pw.react.backend.exceptions.custom.*;

import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class ControllerExceptionHandler {

    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<ExceptionDetails> handleNotFound(InvalidFileException ex, ServletWebRequest request) {
        log.error("Invalid Input Exception: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ExceptionDetails(
                        HttpStatus.NOT_FOUND,
                        ex.getMessage(),
                        request.getRequest().getServletPath()
                ));
    }

    @ExceptionHandler(CarBookingConflictException.class)
    public ResponseEntity<ExceptionDetails> handleCarBookingConflict(CarBookingConflictException ex, ServletWebRequest request) {
        log.error("Invalid Input Exception: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ExceptionDetails(
                        HttpStatus.CONFLICT,
                        ex.getMessage(),
                        request.getRequest().getServletPath()
                ));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ExceptionDetails> handleResourceNotFoundException(ResourceNotFoundException ex, ServletWebRequest request) {
        log.error("Resource Not Found Exception: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ExceptionDetails(
                        HttpStatus.NOT_FOUND,
                        ex.getMessage(),
                        request.getRequest().getServletPath()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionDetails> genericException(Exception ex, ServletWebRequest request) {
        log.error("Generic Exception: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(new ExceptionDetails(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        ex.getMessage(),
                        request.getRequest().getServletPath())
                );
    }


    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ExceptionDetails> noHandlerFoundException(Exception ex, ServletWebRequest request) {
        log.error("NoHandlerFoundException: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ExceptionDetails(
                        HttpStatus.NOT_FOUND,
                        ex.getMessage(),
                        request.getRequest().getServletPath()
                ));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ExceptionDetails> handleNoSuchElement(NoSuchElementException ex, ServletWebRequest request) {
        log.error("NoSuchElementException: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ExceptionDetails(
                        HttpStatus.NOT_FOUND,
                        ex.getMessage(),
                        request.getRequest().getServletPath()
                ));
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ExceptionDetails> handleValidationExceptions(HandlerMethodValidationException ex, ServletWebRequest request) {
        String errMsg = ex.getParameterValidationResults()
                .stream()
                .flatMap(e -> e.getResolvableErrors().stream())
                .map(MessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.joining(","));
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ExceptionDetails(
                        HttpStatus.BAD_REQUEST,
                        errMsg,
                        request.getRequest().getServletPath()
                ));
    }

    @ExceptionHandler(EmailNotFoundException.class)
    public ResponseEntity<ExceptionDetails> handleEmailNotFound(EmailNotFoundException ex, ServletWebRequest request) {
        log.error("EmailNotFoundException: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ExceptionDetails(
                        HttpStatus.UNAUTHORIZED,
                        "EMAIL_NOT_FOUND",
                        request.getRequest().getServletPath()
                ));
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ExceptionDetails> handleInvalidPassword(InvalidPasswordException ex, ServletWebRequest request) {
        log.error("InvalidPasswordException: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ExceptionDetails(
                        HttpStatus.UNAUTHORIZED,
                        "INVALID_PASSWORD",
                        request.getRequest().getServletPath()
                ));
    }

    //422 error codes
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExceptionDetails> handleBodyValidation(MethodArgumentNotValidException ex, ServletWebRequest request) {
        String errMsg = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        log.error("MethodArgumentNotValidException: {}", errMsg);

        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(new ExceptionDetails(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        errMsg,
                        request.getRequest().getServletPath()
                ));
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ExceptionDetails> handleUserAlreadyExists(UserAlreadyExistsException ex, ServletWebRequest request) {
        log.error("UserAlreadyExistsException: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409
                .body(new ExceptionDetails(
                        HttpStatus.CONFLICT,
                        "USER_ALREADY_EXISTS",
                        request.getRequest().getServletPath()
                ));
    }

    @ExceptionHandler(EmailAlreadyInUseException.class)
    public ResponseEntity<ExceptionDetails> handleEmailAlreadyInUse(EmailAlreadyInUseException ex, ServletWebRequest request) {
        log.error("EmailAlreadyInUseException: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409
                .body(new ExceptionDetails(
                        HttpStatus.CONFLICT,
                        "EMAIL_ALREADY_IN_USE",
                        request.getRequest().getServletPath()
                ));
    }


}
