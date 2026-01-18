package pw.react.backend.services;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import pw.react.backend.dto.request.LoginUserRequest;
import pw.react.backend.dto.request.RegisterUserRequest;
import pw.react.backend.dto.request.UpdateUserRequest;
import pw.react.backend.dto.response.GetUserInfoResponse;
import pw.react.backend.dto.response.GetUserIDResponse;

import java.util.List;

public interface UserService {

    GetUserIDResponse registerUser(RegisterUserRequest request);

    GetUserIDResponse loginUser(LoginUserRequest request);

    List<GetUserInfoResponse> getAllUsersInfo();

    GetUserInfoResponse getUserInfoByID(Integer id);

    void deleteUserById(Integer id);

    void updateUserInfoById(Integer id, UpdateUserRequest request);
}
