package pw.react.backend.domain.enums;

import lombok.Getter;

@Getter
public enum CarStatus {
    ACTIVE(1),
    INACTIVE(2),
    UNDER_REPAIR(3);

    private final int Code;
    CarStatus(int code)
    {
        this.Code = code;
    }
}
