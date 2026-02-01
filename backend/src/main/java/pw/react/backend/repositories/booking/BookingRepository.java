package pw.react.backend.repositories.booking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.booking.Booking;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Integer>, JpaSpecificationExecutor<Booking> {
    //used to check if Parkly already made a specific booking - kinda optional
    Optional<Booking> findByUser_UserIdAndProviderExternalBookingId(Integer userId, Integer providerExternalBookingId);
    //finds the latest booking for a given user
    Optional<Booking> findFirstByUser_UserIdOrderByBookingIdDesc(Integer userId);
    Page<Booking> findAllByUser_UserId(Integer userId, Pageable pageable);
    Optional<Booking> findByUser_UserIdAndBookingId(Integer userId, Integer bookingId);

    @Modifying
    @Transactional
    @Query(value = """
        update bookings b
        set b.car_booking_status_id = :completedId
        where b.is_enabled = 1
          and b.car_booking_date_to <= :nowUtc
          and (b.car_booking_status_id is null or b.car_booking_status_id not in (:excludedStatusIds))
        """, nativeQuery = true)
    int bulkCompleteOverdue(
        @Param("completedId") short completedId,
        @Param("nowUtc") Timestamp nowUtc,
        @Param("excludedStatusIds") Collection<Short> excludedStatusIds
    );

}
