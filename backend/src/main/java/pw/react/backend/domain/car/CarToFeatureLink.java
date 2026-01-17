package pw.react.backend.domain.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

@Getter
@Setter
@Entity
@Table(
        name = "CarToFeatureLinks",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UX_CarToFeatureLinks_CarId_CarFeatureId",
                        columnNames = {"CarId", "CarFeatureId"}
                )
        }
)
public class CarToFeatureLink extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CarToFeatureLinkId", nullable = false)
    private Integer carToFeatureLinkId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CarId", nullable = false)
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CarFeatureId", nullable = false)
    private CarFeature carFeature;
}
// on delete of Car, set isEnabled of CarToFeatureLink to false