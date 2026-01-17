package pw.react.backend.domain.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "CarFeatures")
public class CarFeature extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CarFeatureId", nullable = false)
    private Integer carFeatureId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CarFeatureDictionaryId", nullable = false)
    private CarFeatureDictionary dictionary;

    @Column(name = "Value", precision = 19, scale = 4)
    private BigDecimal value;

    @Column(name = "ValueName", nullable = false)
    private String valueName;

    @Column(name = "ValueDisplayName", nullable = false)
    private String valueDisplayName;

    @Column(name = "Description")
    private String description;
}
