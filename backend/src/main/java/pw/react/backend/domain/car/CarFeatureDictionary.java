package pw.react.backend.domain.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

@Getter
@Setter
@Entity
@Table(name = "CarFeatureDictionary")
public class CarFeatureDictionary extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CarFeatureDictionaryId", nullable = false)
    private Short carFeatureDictionaryId;

    @Column(name = "Name", nullable = false)
    private String name;

    // No displayName, cause what if we change the format we want to present data to the frontend
    // then by simply changing toDisplayName function we can change the behavior
    // with displayName we would have to modify a column in all rows
}


