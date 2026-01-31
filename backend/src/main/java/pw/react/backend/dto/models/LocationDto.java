package pw.react.backend.dto.models;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class LocationDto {
    Integer id;
    String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
