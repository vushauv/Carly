package pw.react.backend.domain.booking;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.Location;
import pw.react.backend.domain.user.User;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "Bookings")
public class Booking extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BookingId", nullable = false)
    private Integer bookingId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "UserId", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CarId")
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PickupLocationId")
    private Location pickupLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReturnLocationId")
    private Location returnLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FlatBookingStatusId")
    private BookingStatusDictionary flatBookingStatus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CarBookingStatusId", nullable = false)
    private BookingStatusDictionary carBookingStatus;

    @Column(name = "ProviderExternalBookingId")
    private Long providerExternalBookingId;

    @Column(name = "CarBookingDateFrom", nullable = false)
    private LocalDateTime carBookingDateFrom;

    @Column(name = "CarBookingDateTo", nullable = false)
    private LocalDateTime carBookingDateTo;
}
