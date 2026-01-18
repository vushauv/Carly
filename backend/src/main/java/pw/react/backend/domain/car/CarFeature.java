package pw.react.backend.domain.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(
        name="CarFeatures",
        uniqueConstraints = @UniqueConstraint(
                name="UX_CarFeature_Dictionary_Value",
                columnNames={"CarFeatureDictionaryId","Value"}
        )
)
public class CarFeature extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CarFeatureId", nullable = false)
    private Integer carFeatureId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CarFeatureDictionaryId", nullable = false)
    private CarFeatureDictionary dictionary;

    @Column(name = "Value", nullable = false)
    private String value;
}

