package pw.react.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.controller.path.PathResolver;
import pw.react.backend.domain.user.User;
import pw.react.backend.dto.mapper.UserMapper;
import pw.react.backend.dto.request.user.LoginUserRequest;
import pw.react.backend.dto.request.user.RegisterUserRequest;
import pw.react.backend.dto.request.user.UpdateUserRequest;
import pw.react.backend.dto.response.user.GetUserIDResponse;
import pw.react.backend.dto.response.user.GetUserInfoResponse;
import pw.react.backend.services.user.UserService;

import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(path = UserController.USERS_PATH)
@Slf4j
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class UserController {

    public static final String USERS_PATH = PathResolver.Users.Base;

    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping(path = "/register")
    public ResponseEntity<GetUserIDResponse> register(
            @RequestHeader HttpHeaders headers,
            @Valid @RequestBody RegisterUserRequest request
    ) {
        logHeaders(headers);

        User user = userMapper.toUser(request);
        User savedUser = userService.registerUser(user);
        GetUserIDResponse response = userMapper.toGetUserIDResponse(savedUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(path = "/login")
    public ResponseEntity<GetUserIDResponse> login(
            @RequestHeader HttpHeaders headers,
            @Valid @RequestBody LoginUserRequest request
    ) {
        logHeaders(headers);

        User user = userService.loginUser(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(userMapper.toGetUserIDResponse(user));
    }

    @GetMapping
    public ResponseEntity<List<GetUserInfoResponse>> getAllUsersInfo(
            @RequestHeader HttpHeaders headers,
            @RequestParam(defaultValue = "0") int pageNumber, @RequestParam(defaultValue = "10") int pageSize) {

        logHeaders(headers);

        List<User> users = userService.getAllUsers(pageNumber, pageSize);

        List<GetUserInfoResponse> response = users.stream()
                .map(userMapper::toGetUserInfoResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GetUserInfoResponse> getUserInfoById(@RequestHeader HttpHeaders headers, @PathVariable Integer id) {
        logHeaders(headers);

        User user = userService.getUserByID(id);
        return  ResponseEntity.ok(userMapper.toGetUserInfoResponse(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@RequestHeader HttpHeaders headers, @PathVariable Integer id) {
        logHeaders(headers);
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> updateUserById(
            @RequestHeader HttpHeaders headers,
            @PathVariable Integer id,
            @Valid @RequestBody UpdateUserRequest request) {

        logHeaders(headers);

        userService.updateUser(id, request);


        return ResponseEntity.noContent().build();
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

}
