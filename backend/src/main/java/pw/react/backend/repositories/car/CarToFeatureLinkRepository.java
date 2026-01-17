package pw.react.backend.repositories.car;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.car.CarToFeatureLink;

public interface CarToFeatureLinkRepository extends JpaRepository<CarToFeatureLink, Integer> { }
