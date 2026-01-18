package pw.react.backend.services;

import pw.react.backend.dto.request.LoginUserRequest;
import pw.react.backend.dto.request.RegisterUserRequest;
import pw.react.backend.dto.response.GetUserInfoResponse;
import pw.react.backend.dto.response.GetUserIDResponse;

import java.util.List;

public interface UserService {

    GetUserIDResponse registerUser(RegisterUserRequest request);

    GetUserIDResponse loginUser(LoginUserRequest request);

    List<GetUserInfoResponse> getAllUsersInfo();
}
