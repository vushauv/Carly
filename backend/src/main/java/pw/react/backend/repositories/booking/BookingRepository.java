package pw.react.backend.repositories.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.booking.Booking;

public interface BookingRepository extends JpaRepository<Booking, Integer> { }
