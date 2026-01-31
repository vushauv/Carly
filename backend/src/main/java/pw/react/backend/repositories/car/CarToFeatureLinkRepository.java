package pw.react.backend.repositories.car;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pw.react.backend.domain.car.CarToFeatureLink;

import java.util.List;
import java.util.Optional;

public interface CarToFeatureLinkRepository extends JpaRepository<CarToFeatureLink, Integer> {
    @Query("""
            select l 
            from CarToFeatureLink l
            where l.car.carId = :carId
                        and l.carFeature.dictionary.carFeatureDictionaryId = :dictId
            """)
   Optional<CarToFeatureLink> getLinkByCarAndFeatureType(
           @Param("dictId") Short carFeatureDictionaryId,
           @Param("carId") Integer carId);
}
