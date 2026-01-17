package pw.react.backend.dto.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.user.User;
import pw.react.backend.dto.request.RegisterRequest;
import pw.react.backend.dto.response.RegisterUserResponse;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "userType", ignore = true)
    @Mapping(target = "creationTime", ignore = true)
    @Mapping(target = "modificationTime", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    User toUser(RegisterRequest request);

    RegisterUserResponse toUserResponse(User user);
}
