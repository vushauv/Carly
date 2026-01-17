package pw.react.backend.domain.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "CarFeatureDictionary")
public class CarFeatureDictionary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CarFeatureDictionaryId", nullable = false)
    private Short carFeatureDictionaryId;

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "DisplayName", nullable = false)
    private String displayName;

    @Column(name = "Description")
    private String description;
}