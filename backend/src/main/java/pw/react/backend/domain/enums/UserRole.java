package pw.react.backend.domain.enums;

import lombok.Getter;

@Getter
public enum UserRole {
    CUSTOMER(1),
    SYSTEM(2),
    SUPER_ADMIN(3),
    ADMIN(4);

    private final int Code;
    UserRole(int code)
    {
        this.Code = code;
    }
}