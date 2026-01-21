package pw.react.backend.services.car;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pw.react.backend.domain.car.CarImage;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.car.CarImageRepository;
import pw.react.backend.repositories.car.CarRepository;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CarImageService implements ICarImageService {
    private final CarImageRepository carImageRepository;
    private final CarRepository carRepository;

    @Override
    public List<CarImage> getAll(Integer carId) throws ResourceNotFoundException {
        var car = carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car with carId " + carId + " not found"));
        return carImageRepository.findByCar_CarId(car.getCarId());
    }

    @Override
    public CarImage getById(Integer carId, Integer imageId) throws ResourceNotFoundException {
        if (!carRepository.existsById(carId)) {
            throw new ResourceNotFoundException("Car with carId " + carId + " not found");
        }
        return carImageRepository.findByCar_CarIdAndImageId(carId, imageId)
                .orElseThrow(() -> new ResourceNotFoundException("CarImage with carId " + carId + " for car " + carId + " not found"));
    }

    @Override
    @Transactional
    public CarImage upload(MultipartFile file, Integer carId) throws ResourceNotFoundException {
        var car =  carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car with carId " + carId + " not found"));

    }

    @Override
    @Transactional
    public void delete(CarImage carImage, Integer carId) throws ResourceNotFoundException {
        var imageId = carImage.getImageId();
        if (!carRepository.existsById(carId)) {
            throw new ResourceNotFoundException("Car with carId " + carId + " not found");
        }
        if(!carImageRepository.existsById(imageId))
            throw new ResourceNotFoundException("CarImage with carId " + carId + " for car " + carId + " not found");

        carImageRepository.deleteByCar_CarIdAndImageId(carId, imageId);
    }
}
