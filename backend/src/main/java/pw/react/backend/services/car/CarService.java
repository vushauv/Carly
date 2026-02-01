package pw.react.backend.services.car;

import org.apache.coyote.BadRequestException;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.dto.models.DateRange;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.services.car.model.CarSearchCriteria;

import java.math.BigDecimal;
import java.util.List;

public interface CarService {
    void delete(Integer carId) throws ResourceNotFoundException;
    Car update(Car car, List<CarFeature> requestedCarFeatures) throws ResourceNotFoundException, BadRequestException;
    Car create(Car car, List<CarFeature> requestedCarFeatures) throws ResourceNotFoundException, BadRequestException;
    List<Car> getAll(CarSearchCriteria searchCriteria) throws BadRequestException;
    Car getById(Integer carId) throws ResourceNotFoundException;
    List<Car> getPage(int page, int size, CarSearchCriteria searchCriteria) throws BadRequestException;
    boolean checkCarAvailability(Integer carId, Integer bookingId ,DateRange dateRange) throws ResourceNotFoundException;
    public BigDecimal calculateTotalPrice(Car car, DateRange dateRange) throws ResourceNotFoundException;
}
