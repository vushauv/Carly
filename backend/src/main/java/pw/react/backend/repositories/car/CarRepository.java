package pw.react.backend.repositories.car;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pw.react.backend.domain.car.Car;

import java.util.List;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, Integer> {
    @Query("""
            select c from Car c
            left join fetch c.featureLinks l
            left join fetch l.carFeature f
            left join fetch f.dictionary d
            where c.carId = :carId
            """)
    Optional<Car> findByIdWithFeatures(Integer carId);

    List<Car> findByEnabledTrue();
}
