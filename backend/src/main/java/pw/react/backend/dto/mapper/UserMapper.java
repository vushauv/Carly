package pw.react.backend.dto.mapper;

import org.mapstruct.*;
import pw.react.backend.domain.user.User;
import pw.react.backend.dto.request.user.RegisterUserRequest;
import pw.react.backend.dto.request.user.UpdateUserRequest;
import pw.react.backend.dto.response.user.GetUserInfoResponse;
import pw.react.backend.dto.response.user.GetUserIDResponse;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "userType", ignore = true)
    @Mapping(target = "creationTime", ignore = true)
    @Mapping(target = "modificationTime", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    User toUser(RegisterUserRequest request);

    GetUserIDResponse toGetUserIDResponse(User user);
    GetUserInfoResponse toGetUserInfoResponse(User user);
    void updateUserFromRequest(UpdateUserRequest request, @MappingTarget User user);

}
