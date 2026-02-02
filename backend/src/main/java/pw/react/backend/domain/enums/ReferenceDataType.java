package pw.react.backend.domain.enums;

import lombok.Getter;

@Getter
public enum ReferenceDataType {
    CAR_COLORS("colors"),
    CAR_BRANDS("brands"),
    CAR_FUEL_TYPES("fuelType"),
    CAR_MODELS("models"),
    CAR_STATUSES("status"),
    PICKUP_LOCATIONS("pickupLocations"),
    RETURN_LOCATIONS("returnLocations");

    private String value;
    ReferenceDataType(String value)
    {
        this.value = value;
    }
}
