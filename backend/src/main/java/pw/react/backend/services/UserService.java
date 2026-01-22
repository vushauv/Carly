package pw.react.backend.services;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import pw.react.backend.domain.user.User;
import pw.react.backend.dto.request.LoginUserRequest;
import pw.react.backend.dto.request.RegisterUserRequest;
import pw.react.backend.dto.request.UpdateUserRequest;
import pw.react.backend.dto.response.GetUserInfoResponse;
import pw.react.backend.dto.response.GetUserIDResponse;

import java.util.List;

public interface UserService {

    User registerUser(User user);

    User loginUser(String email, String password);

    List<User> getAllUsers(int pageNumber, int pageSize);

    User getUserByID(Integer id);

    void deleteUserById(Integer id);

    void updateUser(User user);
}
