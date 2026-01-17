package pw.react.backend.domain.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

@Getter
@Setter
@Entity
@Table(name = "Cars")
public class Car extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CarId", nullable = false)
    private Integer carId;
}
