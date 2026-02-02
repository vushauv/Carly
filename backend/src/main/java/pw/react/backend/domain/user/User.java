package pw.react.backend.domain.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Where;
import pw.react.backend.domain.Auditable;

@Getter
@Setter
@Entity
@Where(clause = "is_enabled = 1")
@Table(
        name = "Users",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UX_Users_Email_IsEnabled",
                        columnNames = {"Email", "IsEnabled"}
                )
        }
)
public class User extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserId", nullable = false)
    private Integer userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "UserTypeDictionaryId", nullable = false)
    private UserTypeDictionary userType;

    @Column(name = "FirstName", nullable = false)
    private String firstName;

    @Column(name = "SecondName")
    private String secondName;

    @Column(name = "LastName", nullable = false)
    private String lastName;

    @Column(name = "ContactNumber")
    private Long contactNumber;

    @Column(name = "Email", nullable = false)
    private String email;

    @Column(name = "Password")
    private String password;
}
