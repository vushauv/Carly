package pw.react.backend.domain.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "Users",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UX_Users_Email",
                        columnNames = {"Email"}
                )
        }
)
public class User {

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

    // Email is optional per your example
    @Column(name = "Email")
    private String email;

    // Nullable to support one-time-code / external auth
    @Column(name = "Password")
    private String password;
}
