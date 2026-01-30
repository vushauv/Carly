package pw.react.backend.services.user;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import pw.react.backend.domain.enums.UserRole;
import pw.react.backend.domain.user.User;
import pw.react.backend.domain.user.UserTypeDictionary;
import pw.react.backend.dto.mapper.UserMapper;
import pw.react.backend.dto.request.UpdateUserRequest;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.user.UserRepository;
import pw.react.backend.repositories.user.UserTypeDictionaryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserMainService implements UserService {

    private final UserRepository userRepository;
    private final UserTypeDictionaryRepository userTypeDictionaryRepository;
    private final UserMapper userMapper;

    @Override
    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalStateException("Email already in use");
        }

        // Changed this line
        // TODO: test
        UserTypeDictionary customerType =
                userTypeDictionaryRepository.findById((short)UserRole.CUSTOMER.getCode())
                        .orElseThrow(() -> new IllegalStateException("UserTypeDictionary not found: " + UserRole.CUSTOMER.getCode()));

        user.setUserType(customerType);
        user.setEnabled(true);

        return userRepository.save(user);
    }

    @Override
    public User loginUser(String email, String password) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return user;
    }

    @Override
    public List<User> getAllUsers(int pageNumber, int pageSize) {
        return userRepository.findAll(PageRequest.of(pageNumber, pageSize)).getContent();
    }

    @Override
    public User getUserByID(Integer id) {
        return userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Override
    public void deleteUserById(Integer id) {
        User user = userRepository
                .findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    public void updateUser(Integer id, UpdateUserRequest request) {

        User user = getUserByID(id);

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {//if email is to be changed, it checks if email is not already in use (apart from the user that's actually updating info)
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getUserId().equals(user.getUserId())) {
                            throw new IllegalStateException("Email already in use");
                        }
                    });
        }
        userMapper.updateUserFromRequest(request, user);

        userRepository.save(user);
    }



}


