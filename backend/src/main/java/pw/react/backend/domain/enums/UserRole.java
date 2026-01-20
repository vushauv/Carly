package pw.react.backend.domain.enums;

public enum UserRole {
    CUSTOMER("CUSTOMER"),
    SYSTEM("SYSTEM"),
    SUPER_ADMIN("SUPER_ADMIN"),
    ADMIN("ADMIN");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value.toUpperCase();
    }
}