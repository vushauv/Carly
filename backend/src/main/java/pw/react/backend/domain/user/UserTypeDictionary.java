package pw.react.backend.domain.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

@Getter
@Setter
@Entity
@Table(name = "UserTypeDictionary")
public class UserTypeDictionary extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserTypeDictionaryId", nullable = false)
    private Short userTypeDictionaryId;

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "Description")
    private String description;
}
