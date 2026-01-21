package pw.react.backend.repositories.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pw.react.backend.domain.booking.Booking;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
public interface BookingRepository extends JpaRepository<Booking, Integer>, JpaSpecificationExecutor<Booking> {
    //used to check if Parkly already made a specific booking - kinda optional
    Optional<Booking> findByUser_UserIdAndProviderExternalBookingId(Integer userId, Long providerExternalBookingId);
    //finds the latest booking for a given user
    Optional<Booking> findFirstByUser_UserIdOrderByBookingIdDesc(Integer userId);
    Page<Booking> findAllByUser_UserId(Integer userId, Pageable pageable);
    Optional<Booking> findByUser_UserIdAndBookingId(Integer userId, Integer bookingId);

}
