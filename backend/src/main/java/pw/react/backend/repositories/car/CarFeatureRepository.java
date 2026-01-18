package pw.react.backend.repositories.car;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pw.react.backend.domain.car.CarFeature;

import java.math.BigDecimal;
import java.util.Optional;

public interface CarFeatureRepository extends JpaRepository<CarFeature, Integer> {
    @Query("""
        select f
        from CarFeature f
        where f.dictionary.carFeatureDictionaryId = :dictId
          and f.value = :value
    """)
    Optional<CarFeature> findFeatureBy(
            @Param("dictId") Short dictId,
            @Param("value") String value
    );

    String value(String value);
}