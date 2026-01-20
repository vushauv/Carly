package pw.react.backend.domain.enums;

public enum CarStatus {
    ACTIVE("ACTIVE"),
    INACTIVE("INACTIVE"),
    UNDER_REPAIR("UNDER_REPAIR");

    private final String value;
    CarStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value.toUpperCase();
    }
}
