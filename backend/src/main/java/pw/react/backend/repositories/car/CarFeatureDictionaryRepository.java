package pw.react.backend.repositories.car;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.car.CarFeatureDictionary;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface CarFeatureDictionaryRepository extends JpaRepository<CarFeatureDictionary, Short> {
    Optional<CarFeatureDictionary> findByName(String name);
    List<CarFeatureDictionary> findByNameIn(Set<String> names);
}


