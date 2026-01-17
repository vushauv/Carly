package pw.react.backend.services;

import java.util.List;
import java.util.Optional;

import pw.react.backend.domain.User;
import pw.react.backend.exceptions.ResourceNotFoundException;

//TODO: long vs Long
public interface UserService {
    User saveUser(User user);
    User updateUser(Long userId, User updatedUser) throws ResourceNotFoundException;
    boolean deleteUser(Long userId);
    Optional<User> getById(Long userId);
    List<User> getAll();
    List<User> getUsersPage(int page, int size);
}
