package pw.react.backend.domain.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

@Getter
@Setter
@Entity
@Table(name = "CarImages")
public class CarImage extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CarImageId", nullable = false)
    private Integer carImageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CarId", nullable = false)
    private Car car;

    @Column(name = "Url", nullable = false)
    private String url;
}
