package pw.react.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.Location;

import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Integer> {
    Optional<Location> findByLocationName(String locationName);
}