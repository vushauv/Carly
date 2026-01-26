package pw.react.backend.domain.enums;

import lombok.Getter;

@Getter
public enum CarFeatureType
{
    COLOR(1),
    BRAND(2),
    FUEL_TYPE(3),
    MODEL(4),
    STATUS(5),
    PRICE(6);

    private final int Code;
    CarFeatureType(int code)
    {
        this.Code = code;
    }
}
