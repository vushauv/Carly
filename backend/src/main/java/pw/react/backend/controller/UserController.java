package pw.react.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
import pw.react.backend.dto.mapper.user.UserMapper;
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

    @Operation(
            summary = "Register user",
            description = """
        - Registers a new user account using the provided details.
        - Returns the identifier of the newly created user.
        """
    )
    @ApiResponse(
            responseCode = "201",
            description = "User successfully registered",
            content = @Content(schema = @Schema(implementation = GetUserIDResponse.class)))
    @ApiResponse(responseCode = "409", description = "User already exists or email already in use")
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

    @Operation(summary = "Login user",
            description = """
        - Authenticates a user using email and password.
        - Returns the identifier of the authenticated user.
        """)
    @ApiResponse(
            responseCode = "200",
            description = "Login successful",
            content = @Content(schema = @Schema(implementation = GetUserIDResponse.class)))
    @ApiResponse(responseCode = "401", description = "Invalid credentials (email not found or incorrect password)")
    @PostMapping(path = "/login")
    public ResponseEntity<GetUserIDResponse> login(
            @RequestHeader HttpHeaders headers,
            @Valid @RequestBody LoginUserRequest request
    ) {
        logHeaders(headers);

        User user = userService.loginUser(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(userMapper.toGetUserIDResponse(user));
    }

    @Operation(summary = "Get users",
            description = """
        - Retrieves a paginated list of users.
        - `pageNumber` and `pageSize` control pagination (defaults: 0 and 10).
        """)
    @ApiResponse(
            responseCode = "200",
            description = "Users successfully retrieved",
            content = @Content(schema = @Schema(implementation = GetUserInfoResponse.class))
    )
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

    @Operation(summary = "Get user by ID",
            description = """
        - Retrieves user details by identifier.
        """)
    @ApiResponse(
            responseCode = "200",
            description = "User successfully retrieved",
            content = @Content(schema = @Schema(implementation = GetUserInfoResponse.class))
    )
    @ApiResponse(responseCode = "404", description = "User not found")
    @GetMapping("/{id}")
    public ResponseEntity<GetUserInfoResponse> getUserInfoById(@RequestHeader HttpHeaders headers, @PathVariable Integer id) {
        logHeaders(headers);

        User user = userService.getUserByID(id);
        return  ResponseEntity.ok(userMapper.toGetUserInfoResponse(user));
    }

    @Operation(
            summary = "Delete user",
            description = """
        - Deletes a user identified by ID.
        - Successful deletion returns no content.
        """
    )
    @ApiResponse(responseCode = "204", description = "User successfully deleted")
    @ApiResponse(responseCode = "404", description = "User not found")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@RequestHeader HttpHeaders headers, @PathVariable Integer id) {
        logHeaders(headers);
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update user",
            description = """
        - Updates user fields provided in the request body.
        - Fields not provided remain unchanged.
        """)
    @ApiResponse(responseCode = "204", description = "User successfully updated")
    @ApiResponse(responseCode = "404", description = "User not found")
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
