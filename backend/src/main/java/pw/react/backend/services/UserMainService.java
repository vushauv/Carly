package pw.react.backend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pw.react.backend.domain.user.User;
import pw.react.backend.domain.user.UserTypeDictionary;
import pw.react.backend.dto.request.LoginUserRequest;
import pw.react.backend.dto.request.RegisterUserRequest;
import pw.react.backend.dto.request.UpdateUserRequest;
import pw.react.backend.dto.response.GetUserInfoResponse;
import pw.react.backend.dto.response.GetUserIDResponse;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.user.UserRepository;
import pw.react.backend.repositories.user.UserTypeDictionaryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserMainService implements UserService {

    private final UserRepository userRepository;
    private final UserTypeDictionaryRepository userTypeDictionaryRepository;

    @Override
    public User registerUser(User user) {

        if (userRepository.existsByEmailAndIsEnabledTrue(user.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        UserTypeDictionary customerType =
                userTypeDictionaryRepository.findById((short) 1)
                        .orElseThrow(() -> new ResourceNotFoundException("UserTypeDictionary not found: 1"));

        user.setUserType(customerType);
        user.setEnabled(true);

        return userRepository.save(user);
    }

    @Override
    public User loginUser(String email, String password) {

        User user = userRepository
                .findByEmailAndIsEnabledTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAllByIsEnabledTrue();
    }

    @Override
    public User getUserByID(Integer id) {
        return userRepository.findByUserIdAndIsEnabledTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Override
    public void deleteUserById(Integer id) {
        User user = userRepository
                .findByUserIdAndIsEnabledTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    public void updateUser(User newUser) {
        userRepository.save(newUser);
    }


}


