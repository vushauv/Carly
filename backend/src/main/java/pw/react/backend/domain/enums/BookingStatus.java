package pw.react.backend.domain.enums;

public enum BookingStatus {
    CANCELLED("CANCELLED"),
    CREATED("CREATED"),
    COMPLETED("COMPLETED");

    private final String value;
    BookingStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value.toUpperCase();
    }
}
