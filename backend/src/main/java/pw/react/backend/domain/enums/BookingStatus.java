package pw.react.backend.domain.enums;

import lombok.Getter;

@Getter
public enum BookingStatus {
    CREATED(0),
    COMPLETED(1),
    CANCELLED(2);

    private final int Code;
    BookingStatus(int code)
    {
        this.Code = code;
    }
}
