package pw.react.backend.domain.booking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Where;
import pw.react.backend.domain.Auditable;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.user.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

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
    @JoinColumn(name = "CarId", nullable = false)
    private Car car;

    // TODO: must be non-nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PickupLocationId", nullable = false)
    private Location pickupLocation;

    // TODO: must be non-nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReturnLocationId", nullable = false)
    private Location returnLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FlatBookingStatusId")
    private BookingStatusDictionary flatBookingStatus;

    // TODO: must be non-nullable
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "CarBookingStatusId", nullable = false)
    private BookingStatusDictionary carBookingStatus;

    @Column(name = "ProviderExternalBookingId")
    private UUID providerExternalBookingId;

    // TODO: must be non-nullable
    @Column(name = "CarBookingDateFrom", nullable = false)
    private LocalDateTime carBookingDateFrom;

    // TODO: must be non-nullable
    @Column(name = "CarBookingDateTo", nullable = false)
    private LocalDateTime carBookingDateTo;

    @Column(name = "carTotalPrice", nullable = false)
    private BigDecimal carTotalPrice;

    @Column(name = "flatTotalPrice", nullable = true)
    private BigDecimal flatTotalPrice;
}
