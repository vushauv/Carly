package pw.react.backend.services.car;

import org.hibernate.query.Page;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.exceptions.ResourceNotFoundException;

import java.util.List;

public interface ICarService {
    void delete(Integer carId) throws ResourceNotFoundException;
    Car update(Integer id, List<CarFeature> requestedCarFeatures) throws ResourceNotFoundException;
    Car create(List<CarFeature> requestedCarFeatures);
    List<Car> getAll();
    Car getById(Integer carId) throws ResourceNotFoundException;
    List<Car> getPage(int page, int size);
}
