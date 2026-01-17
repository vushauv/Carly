package pw.react.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "Locations")
public class Location extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LocationId", nullable = false)
    private Integer locationId;

    @Column(name = "LocationName", nullable = false)
    private String locationName;

    @Column(name = "Latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "Longitude", precision = 10, scale = 7)
    private BigDecimal longitude;
}
