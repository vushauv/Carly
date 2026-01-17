package pw.react.backend.services;

import pw.react.backend.dto.request.LoginRequest;
import pw.react.backend.dto.request.RegisterRequest;
import pw.react.backend.dto.response.RegisterUserResponse;

public interface UserService {

    RegisterUserResponse register(RegisterRequest request);

    RegisterUserResponse login(LoginRequest request);
}
