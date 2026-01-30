package pw.react.backend.services.car;

import org.apache.coyote.BadRequestException;
import org.hibernate.query.Page;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.dto.request.car.CarSearchParams;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.services.car.model.CarSearchCriteria;

import java.math.BigDecimal;
import java.util.List;

public interface ICarService {
    void delete(Integer carId) throws ResourceNotFoundException;
    Car update(Car car, List<CarFeature> requestedCarFeatures) throws ResourceNotFoundException, BadRequestException;
    Car create(Car car, List<CarFeature> requestedCarFeatures) throws ResourceNotFoundException, BadRequestException;
    List<Car> getAll(CarSearchCriteria searchCriteria) throws BadRequestException;
    Car getById(Integer carId) throws ResourceNotFoundException;
    List<Car> getPage(int page, int size, CarSearchCriteria searchCriteria) throws BadRequestException;
}
