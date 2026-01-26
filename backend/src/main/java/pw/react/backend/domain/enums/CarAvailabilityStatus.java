package pw.react.backend.domain.enums;

import lombok.Getter;

@Getter
public enum CarAvailabilityStatus {
    AVAILABLE(1),
    RENTED(2);

    private final int Code;
    CarAvailabilityStatus(int code)
    {
        this.Code = code;
    }
}
