package pw.react.backend.dto.mapper;

import org.mapstruct.*;
import pw.react.backend.domain.Company;
import pw.react.backend.domain.User;
import pw.react.backend.dto.request.CreateUserRequest;
import pw.react.backend.dto.request.UpdateUserRequest;
import pw.react.backend.dto.response.UserResponse;
import pw.react.backend.dto.response.GetUserResponse;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    @Mapping(target = "birthDate", source = "createUserRequest.dayOfBirth")
    User createRequestToUser(CreateUserRequest createUserRequest);
    List<User> createRequestToUserList(List<CreateUserRequest> users);

    UserResponse userToResponse(User user);
    List<UserResponse> userToResponseList(List<User> users);

    @Mapping(target = "birthDate", source = "updatedUser.dayOfBirth")
    User updateRequestToUser(UpdateUserRequest updatedUser);

    @Mapping(target = "dayOfBirth", source = "user.birthDate")
    GetUserResponse userToGetUserResponse(User user);
    List<GetUserResponse> userToGetUserResponseList(List<User> users);
}
