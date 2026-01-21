package pw.react.backend.repositories.car;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pw.react.backend.domain.car.CarImage;

import java.util.List;
import java.util.Optional;

public interface CarImageRepository extends JpaRepository<CarImage, Integer> {
    List<CarImage> findByCar_CarId(Integer carId);
    Optional<CarImage> findByCar_CarIdAndImageId(Integer carId, Integer imageId);
    void deleteByCar_CarIdAndImageId(Integer carId, Integer imageId);

    @Query("""
        SELECT COALESCE(MAX(ci.imageId), 0)
        FROM CarImage ci
        WHERE ci.car.carId = :carId
    """)
    int findMaxIdByCarId(@Param("carId") Integer carId);
}