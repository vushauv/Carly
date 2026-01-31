package pw.react.backend.domain.enums;

import lombok.Getter;

@Getter
public enum SystemUsers {
    CARLY(1),
    PARKLY(2),
    FLATLY(3);

    private final int Code;
    SystemUsers(int code)
    {
        this.Code = code;
    }
}
