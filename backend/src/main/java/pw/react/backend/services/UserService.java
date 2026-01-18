package pw.react.backend.services;

import pw.react.backend.dto.request.LoginUserRequest;
import pw.react.backend.dto.request.RegisterUserRequest;
import pw.react.backend.dto.response.GetUserInfoResponse;
import pw.react.backend.dto.response.GetUserIDResponse;

public interface UserService {

    GetUserIDResponse register(RegisterUserRequest request);

    GetUserIDResponse login(LoginUserRequest request);
}
