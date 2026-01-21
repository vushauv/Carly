package pw.react.backend.services.car;

import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.web.multipart.MultipartFile;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarImage;
import pw.react.backend.exceptions.ResourceNotFoundException;

import java.util.List;

public interface ICarImageService {
    List<CarImage> getAll(Integer carId) throws ResourceNotFoundException;
    CarImage getById(Integer carId, Integer imageId) throws ResourceNotFoundException;
    CarImage upload(MultipartFile file, Integer carId) throws ResourceNotFoundException;
    void delete(Integer carId, Integer fileId) throws ResourceNotFoundException;
}
