package pw.react.backend.domain.booking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Where;
import pw.react.backend.domain.Auditable;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.Location;
import pw.react.backend.domain.user.User;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Where(clause = "is_enabled = 1")
@Table(name = "Bookings")
public class Booking extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BookingId", nullable = false)
    private Integer bookingId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "UserId", nullable = false)
    private User user;

    // TODO: must be non-nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CarId")
    private Car car;

    // TODO: must be non-nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PickupLocationId")
    private Location pickupLocation;

    // TODO: must be non-nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReturnLocationId")
    private Location returnLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FlatBookingStatusId")
    private BookingStatusDictionary flatBookingStatus;

    // TODO: must be non-nullable
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "CarBookingStatusId")
    private BookingStatusDictionary carBookingStatus;

    @Column(name = "ProviderExternalBookingId")
    private Integer providerExternalBookingId;

    // TODO: must be non-nullable
    @Column(name = "CarBookingDateFrom")
    private LocalDateTime carBookingDateFrom;

    // TODO: must be non-nullable
    @Column(name = "CarBookingDateTo")
    private LocalDateTime carBookingDateTo;
}
