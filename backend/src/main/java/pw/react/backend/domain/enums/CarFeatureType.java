package pw.react.backend.domain.enums;

public enum CarFeatureType
{
    COLOR("COLOR"),
    BRAND("BRAND"),
    FUEL_TYPE("FUEL_TYPE"),
    MODEL("MODEL"),
    STATUS("STATUS");

    private final String value;

    CarFeatureType(String value){
        this.value = value;
    }

    public String getValue() {
        return this.value.toLowerCase();
    }
}
