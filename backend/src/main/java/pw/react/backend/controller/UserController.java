package pw.react.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.dto.request.LoginUserRequest;
import pw.react.backend.dto.request.RegisterUserRequest;
import pw.react.backend.dto.response.GetUserIDResponse;
import pw.react.backend.dto.response.GetUserInfoResponse;
import pw.react.backend.services.UserService;

import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(path = UserController.USERS_PATH)
@Slf4j
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class UserController {

    public static final String USERS_PATH = "/users";

    private final UserService userService;

    @PostMapping(path = "/register")
    public ResponseEntity<GetUserIDResponse> register(
            @RequestHeader HttpHeaders headers,
            @Valid @RequestBody RegisterUserRequest request
    ) {
        logHeaders(headers);
        GetUserIDResponse response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(path = "/login")
    public ResponseEntity<GetUserIDResponse> login(
            @RequestHeader HttpHeaders headers,
            @Valid @RequestBody LoginUserRequest request
    ) {
        logHeaders(headers);
        GetUserIDResponse response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<GetUserInfoResponse>> getAllUsersInfo(@RequestHeader HttpHeaders headers) {
        logHeaders(headers);
        return ResponseEntity.ok(userService.getAllUsersInfo());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GetUserInfoResponse> getUserInfoById(@RequestHeader HttpHeaders headers, @PathVariable Integer id) {
        logHeaders(headers);
        return  ResponseEntity.ok(userService.getUserInfoByID(id));
    }

    private void logHeaders(@RequestHeader HttpHeaders headers) {
        log.info(
                "Controller request headers {}",
                headers.entrySet()
                        .stream()
                        .map(e -> String.format("%s->[%s]", e.getKey(), String.join(",", e.getValue())))
                        .collect(joining(","))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteUserById(@RequestHeader HttpHeaders headers, @PathVariable Integer id) {
        logHeaders(headers);
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }
}
