package pw.react.backend.services.car;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import pw.react.backend.domain.car.CarImage;
import pw.react.backend.exceptions.InvalidFileException;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.car.CarImageRepository;
import pw.react.backend.repositories.car.CarRepository;

import java.io.IOException;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CarImageMainService implements CarImageService {
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
    public CarImage upload(MultipartFile file, Integer carId)
            throws ResourceNotFoundException, InvalidFileException
    {
        var car =  carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car with carId " + carId + " not found"));

        long maxFileSize = 5*1024*1024; // 5MB
        if(file.getSize() > maxFileSize)
            throw new InvalidFileException("File is too large");

        // This function provides path cleaning and normalisation. Eliminates path traversal problems
        String filename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());

        // TODO: consider moving to a new functions
        // Double check won't hurt
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new InvalidFileException("Filename containts invalid path sequence " + filename + " .Try again");
        }

        // Retry policy, which prevents id collissions
        for (int attempt = 0; attempt < 3; attempt++) {
            int imageId = carImageRepository.findMaxIdByCarId(carId) + 1;

            try {
                CarImage carImage = new CarImage(filename,
                        file.getContentType(),
                        car,
                        imageId,
                        file.getBytes(),
                        file.getSize());

                // Forces the INSERT immediately; Otherwise we would not notice DataIntegrityViolation
                return carImageRepository.saveAndFlush(carImage);
            } catch (DataIntegrityViolationException ex) {
                // collision on (CarId, ImageId) → retry
                continue;
            } catch (IOException ex) {
                throw new InvalidFileException("Failed to store " + filename + ". Try again");
            }
        }
        throw new InvalidFileException("Upload conflict .Try again");
    }

    @Override
    @Transactional
    public void delete(Integer carId, Integer imageId)
            throws ResourceNotFoundException
    {
        if (!carRepository.existsById(carId)) {
            throw new ResourceNotFoundException("Car with carId " + carId + " not found");
        }
        if(!carImageRepository.findByCar_CarIdAndImageId(carId, imageId).isPresent())
            throw new ResourceNotFoundException("CarImage with carId " + carId + " for car " + carId + " not found");

        carImageRepository.deleteByCar_CarIdAndImageId(carId, imageId);
    }
}
