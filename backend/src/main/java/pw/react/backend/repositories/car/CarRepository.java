package pw.react.backend.repositories.car;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;

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
                and f in :features 
        group by c.carId
        having count(f) = :featureCount
        """)
    List<Integer> findCarIdsMatchingAllFeatures(@Param("features") Collection<CarFeature> features,
                                                @Param("featureCount") int featureCount);

    List<Car> findByCarIdIn(Collection<Integer> carIds);
}
