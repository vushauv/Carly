package pw.react.backend.repositories.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.booking.Booking;

import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    //used to check if Parkly already made a specific booking - kinda optional
    Optional<Booking> findByUser_UserIdAndProviderExternalBookingId(Integer userId, Long providerExternalBookingId);
    //finds the latest booking for a given user
    Optional<Booking> findFirstByUser_UserIdOrderByBookingIdDesc(Integer userId);

}
