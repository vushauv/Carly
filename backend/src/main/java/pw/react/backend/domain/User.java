package pw.react.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements Serializable {
    //TODO: change the serialVersionUID?
    @Serial
    private static final long serialVersionUID = -6783504532088859179L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Column
    private String firstName;

    @Column
    private String lastName;

    @Column
    private String email; //TODO: validation?

    @Column
    private LocalDateTime birthDate; //TODO: change to plain Date from Datetime if possible
}
