package pw.react.backend.domain.enums;

import lombok.Getter;

@Getter
public enum CarFuelType {
    GAS(1),
    DIESEL(2),
    ELECTRIC(3),
    HYBRID(4);

    private final int Code;
    CarFuelType(int code)
    {
        this.Code = code;
    }
}