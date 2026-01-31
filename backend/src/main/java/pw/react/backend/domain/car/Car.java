package pw.react.backend.domain.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.Where;
import pw.react.backend.domain.Auditable;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "Cars")
// By default, filters all queries to Cars for is_enabled == true
@Where(clause = "is_enabled = true")
public class Car extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CarId", nullable = false)
    private Integer carId;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CarToFeatureLink> featureLinks = new HashSet<>();

    @Column(name = "Price", nullable = false)
    private BigDecimal price;
}
