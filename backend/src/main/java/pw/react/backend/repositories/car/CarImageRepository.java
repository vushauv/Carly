package pw.react.backend.repositories.car;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.car.CarImage;

public interface CarImageRepository extends JpaRepository<CarImage, Integer> { }