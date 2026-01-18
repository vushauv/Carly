package pw.react.backend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pw.react.backend.domain.user.User;
import pw.react.backend.domain.user.UserTypeDictionary;
import pw.react.backend.dto.mapper.UserMapper;
import pw.react.backend.dto.request.LoginUserRequest;
import pw.react.backend.dto.request.RegisterUserRequest;
import pw.react.backend.dto.response.GetUserInfoResponse;
import pw.react.backend.dto.response.GetUserIDResponse;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.user.UserRepository;
import pw.react.backend.repositories.user.UserTypeDictionaryRepository;

@Service
@RequiredArgsConstructor
public class UserMainService implements UserService {

    private final UserRepository userRepository;
    private final UserTypeDictionaryRepository userTypeDictionaryRepository;
    private final UserMapper userMapper;

    @Override
    public GetUserIDResponse register(RegisterUserRequest request) {

        if (userRepository.existsByEmailAndIsEnabledTrue(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = userMapper.toUser(request);

        UserTypeDictionary customerType =
                userTypeDictionaryRepository.findById((short) 1)
                        .orElseThrow(() -> new ResourceNotFoundException("UserTypeDictionary not found: 1"));

        user.setUserType(customerType);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        return userMapper.toGetUserIDResponse(savedUser);
    }

    @Override
    public GetUserIDResponse login(LoginUserRequest request) {

        User user = userRepository
                .findByEmailAndIsEnabledTrue(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getEmail()));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return userMapper.toGetUserIDResponse(user);
    }
}
