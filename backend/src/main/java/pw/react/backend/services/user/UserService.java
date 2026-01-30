package pw.react.backend.services.user;

import pw.react.backend.domain.user.User;
import pw.react.backend.dto.request.user.UpdateUserRequest;

import java.util.List;

public interface UserService {

    User registerUser(User user);

    User loginUser(String email, String password);

    List<User> getAllUsers(int pageNumber, int pageSize);

    User getUserByID(Integer id);

    void deleteUserById(Integer id);

    void updateUser(Integer id, UpdateUserRequest request);
}
