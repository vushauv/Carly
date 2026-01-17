package pw.react.backend.domain.booking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "BookingStatusDictionary")
public class BookingStatusDictionary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BookingStatusDictionaryId", nullable = false)
    private Short bookingStatusDictionaryId;

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "DisplayName", nullable = false)
    private String displayName;

    @Column(name = "Description")
    private String description;
}
