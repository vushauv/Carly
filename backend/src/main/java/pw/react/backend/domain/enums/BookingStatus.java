package pw.react.backend.domain.enums;

import lombok.Getter;

@Getter
public enum BookingStatus {
    CREATED(1),
    COMPLETED(2),
    CANCELLED(3);

    private final int Code;
    BookingStatus(int code)
    {
        this.Code = code;
    }
}
