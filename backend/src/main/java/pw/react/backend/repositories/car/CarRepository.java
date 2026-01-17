package pw.react.backend.repositories.car;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.car.Car;

public interface CarRepository extends JpaRepository<Car, Integer> { }
