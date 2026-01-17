package pw.react.backend.repositories.car;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.car.CarFeatureDictionary;

import java.util.Optional;

public interface CarFeatureDictionaryRepository extends JpaRepository<CarFeatureDictionary, Short> {
}