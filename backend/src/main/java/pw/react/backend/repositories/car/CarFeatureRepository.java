package pw.react.backend.repositories.car;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.car.CarFeature;

import java.util.Optional;

public interface CarFeatureRepository extends JpaRepository<CarFeature, Integer> {
    Optional<CarFeature> findByName(String name);
}