package pw.react.backend.domain.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

import java.util.Objects;

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

    // Do not mutate CarId or DictionaryId
    @Override
    public int hashCode() {
        return Objects.hash(
                car.getCarId(),
                carFeature.getDictionary().getCarFeatureDictionaryId()
        );
    }
}
