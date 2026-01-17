package pw.react.backend.domain.booking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

@Getter
@Setter
@Entity
@Table(name = "BookingStatusDictionary")
public class BookingStatusDictionary extends Auditable {

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
