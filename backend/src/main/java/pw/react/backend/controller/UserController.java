package pw.react.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pw.react.backend.domain.Company;
import pw.react.backend.domain.User;
import pw.react.backend.dto.mapper.UserMapper;
import pw.react.backend.dto.request.CreateCompanyRequest;
import pw.react.backend.dto.request.CreateUserRequest;
import pw.react.backend.dto.request.UpdateCompanyRequest;
import pw.react.backend.dto.request.UpdateUserRequest;
import pw.react.backend.dto.response.*;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.services.UserService;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Stream;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(path = UserController.USERS_PATH)
@Slf4j
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class UserController {

    public static final String USERS_PATH = "/users";

    private final UserService userService;
    private final UserMapper userMapper;

    private void logHeaders(@RequestHeader HttpHeaders headers) {
        log.info("Controller request headers {}",
                headers.entrySet()
                        .stream()
                        .map(entry -> String.format("%s->[%s]", entry.getKey(), String.join(",", entry.getValue())))
                        .collect(joining(","))
        );
    }

    @PostMapping(path = "")
    public ResponseEntity<Collection<UserResponse>> createUsers(@RequestHeader HttpHeaders headers,
                                                                       @Valid @RequestBody List<CreateUserRequest> users) {
        logHeaders(headers);
        List<User> usersToCreate  = userMapper.createRequestToUserList(users);
        List<UserResponse> result = new ArrayList<>();
        for(User user : usersToCreate ) {
            User saved = userService.saveUser(user);
            result.add(userMapper.userToResponse(saved));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping(path = "/{userId}")
    public ResponseEntity<GetUserResponse> getUser(@RequestHeader HttpHeaders headers, @PathVariable Long userId) {
        logHeaders(headers);
        GetUserResponse result = userService.getById(userId)
                .map(userMapper::userToGetUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("User with %d does not exist", userId)));
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<GetUserResponse>> getAllUsers(@RequestHeader HttpHeaders headers,
                                                                    @RequestParam(required = false) Integer page,
                                                                    @RequestParam(required = false) Integer size) {
        logHeaders(headers);
        if (page == null || size == null) {
            return ResponseEntity.ok(userMapper.userToGetUserResponseList(userService.getAll()));
        }
        return ResponseEntity.ok(userMapper.userToGetUserResponseList(userService.getUsersPage(page, size)));
    }

    @PutMapping(path = "/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateUser(@RequestHeader HttpHeaders headers, @PathVariable Long userId,
                              @Valid @RequestBody UpdateUserRequest updatedUser) {
        logHeaders(headers);
        userService.updateUser(userId, userMapper.updateRequestToUser(updatedUser));
    }

    @DeleteMapping(path = "/{userId}")
    public ResponseEntity<String> deleteUser(@RequestHeader HttpHeaders headers, @PathVariable Long userId) {
        logHeaders(headers);
        boolean deleted = userService.deleteUser(userId);
        if(!deleted) {
            return ResponseEntity.badRequest().body(String.format("User with id %s does not exists.", userId));
        }
        return ResponseEntity.ok(String.format("User with id %s deleted.", userId));
    }

}
