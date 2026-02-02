package pw.react.backend.repositories.car;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, Integer> {
    @Query("""
            select distinct c from Car c
            left join fetch c.featureLinks l
            left join fetch l.carFeature f
            left join fetch f.dictionary d
            where c.carId = :carId
            """)
    Optional<Car> findByIdWithFeatures(Integer carId);

    //Hibernate can return Car even though we group by
    @Query("""
        select c.carId
        from Car c
        join c.featureLinks l
        join l.carFeature f
        where c.isEnabled = true 
                and c.carId in :carIds
                and f in :features 
        group by c.carId
        having count(f) = :featureCount
        """)
    List<Integer> findCarIdsMatchingAllFeaturesWithin(@Param("carIds") List<Integer> carIds,
                                                @Param("features") Collection<CarFeature> features,
                                                @Param("featureCount") int featureCount);

    @Query("""
        select c.carId
        from Car c
        join c.featureLinks l
        join l.carFeature f
        where c.isEnabled = true 
                and f in :features 
        group by c.carId
        having count(f) = :featureCount
        """)
    List<Integer> findCarIdsMatchingAllFeatures(@Param("features") Collection<CarFeature> features,
                                                @Param("featureCount") int featureCount);

    @Query("""
    select c.carId
    from Car c
    where c.isEnabled = true
      and not exists (
          select 1
          from Booking b
          where b.car = c
            and b.carBookingDateFrom < :to
            and b.carBookingDateTo > :from
            and b.carBookingStatus.bookingStatusDictionaryId <> :cancelledStatusId
            
      )
""")
    List<Integer> filterAvailableCarIds(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("cancelledStatusId") Integer cancelledStatusId
    );

    @Query("""
    select c.carId
    from Car c
    where c.isEnabled = true
      and exists (
          select 1
          from Booking b
          where b.car = c
            and (b.carBookingDateFrom < :to
            and b.carBookingDateTo > :from)
            and b.carBookingStatus.bookingStatusDictionaryId <> :cancelledStatusId
            
      )
""")
    List<Integer> filterRentedCarIds(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("cancelledStatusId") Integer cancelledStatusId
    );

    @Query("""
    select c
    from Car c
    where c.isEnabled = true
    and c.carId = :carId
      and not exists (
          select 1
          from Booking b
          where b.car = c
            and (b.carBookingDateFrom < :to
            and b.carBookingDateTo > :from)
            and b.carBookingStatus.bookingStatusDictionaryId <> :cancelledStatusId
            
      )
""")
    Optional<Car> checkCarAvailability(@Param("carId") Integer carId,
                                       @Param("from") LocalDateTime from,
                                       @Param("to") LocalDateTime to,
                                       @Param("cancelledStatusId") Integer cancelledStatusId);

    // Produces a consistent order
    List<Car> findByCarIdInOrderByCarIdAsc(List<Integer> carIds);
    Page<Car> findByCarIdInOrderByCarIdAsc(
            List<Integer> carIds,
            Pageable pageable
    );

    List<Car> findAllByOrderByCarIdAsc();
    Page<Car> findAllByOrderByCarIdAsc(Pageable pageable);
}
