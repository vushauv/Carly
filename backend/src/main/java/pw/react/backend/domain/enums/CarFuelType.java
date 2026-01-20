package pw.react.backend.domain.enums;

import pw.react.backend.domain.car.CarFeature;

public enum CarFuelType {
    GAS("GAS"),
    DIESEL("DIESEL"),
    ELECTRIC("ELECTRIC"),
    HYBRID("HYBRID");

    private final String value;
    CarFuelType(String value) {
        this.value = value;
    }
    public String getValue() {
        return this.value.toUpperCase();
    }
}