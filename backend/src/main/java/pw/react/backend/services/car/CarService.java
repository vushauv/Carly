package pw.react.backend.services.car;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarToFeatureLink;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.car.CarFeatureDictionaryRepository;
import pw.react.backend.repositories.car.CarFeatureRepository;
import pw.react.backend.repositories.car.CarRepository;

import java.util.HashSet;
import java.util.List;


@Service
@Slf4j
@RequiredArgsConstructor
public class CarService implements ICarService {

    private final CarRepository carRepository;
    private final CarFeatureRepository carFeatureRepository;
    private final CarFeatureDictionaryRepository carFeatureDictionaryRepository;

    @Override
    @Transactional
    public void delete(Integer id) throws ResourceNotFoundException
    {
        Car car = carRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Car with id " + id + " was not found."));
        car.setEnabled(false); // setting the isEnabled flag to false indicates deletion of the object
        log.info("Car with id {} has been deleted.", id);
    }

    @Override
    @Transactional
    public Car update(Integer id, List<CarFeature> requestedCarFeatures) throws ResourceNotFoundException, BadRequestException
    {
        Car car = carRepository.findByIdWithFeatures(id).orElseThrow(() ->
                new ResourceNotFoundException("Car with id " + id + " was not found."));

        checkDuplicateFeatureTypes(requestedCarFeatures);
        linkFeatures(car, requestedCarFeatures);
        return carRepository.save(car);
    }

    @Override
    @Transactional
    public Car create(List<CarFeature> requestedCarFeatures) throws ResourceNotFoundException, BadRequestException
    {
        Car car = new Car();

        checkDuplicateFeatureTypes(requestedCarFeatures);
        linkFeatures(car, requestedCarFeatures);
        return carRepository.save(car);
    }

    // TODO: Add filtering here
    @Override
    public List<Car> getAll() {
        return carRepository.findAll();
    }

    @Override
    public Car getById(Integer carId) throws ResourceNotFoundException
    {
        var car = carRepository.findByIdWithFeatures(carId);
        return car.orElseThrow(() -> new ResourceNotFoundException("Car with id " + carId + " was not found."));
    }

    @Override
    public List<Car> getPage(int page, int size)
    {
        int defaultPageSize = 10;
        return carRepository.findAll(PageRequest.of(page, size == 0  ? defaultPageSize : size)).getContent();
    }

    private CarFeature resolveOrCreateFeature(CarFeature reqFeature) throws BadRequestException
    {
        Short dictId = reqFeature.getDictionary().getCarFeatureDictionaryId();
        if(!carFeatureDictionaryRepository.existsById(dictId))
            throw new BadRequestException("Dictionary with id " + dictId + " was not found.");

        return carFeatureRepository.findFeatureBy(
                reqFeature.getDictionary().getCarFeatureDictionaryId(),
                reqFeature.getValue()
        ).orElseGet(() -> {
            CarFeature created = new CarFeature();
            var dictRef = carFeatureDictionaryRepository
                    .getReferenceById(reqFeature.getDictionary().getCarFeatureDictionaryId());

            created.setDictionary(dictRef);
            created.setValue(reqFeature.getValue());
            return carFeatureRepository.save(created);
        });
    }

    private void linkFeatures(Car car, List<CarFeature> requestedCarFeatures) throws BadRequestException
    {
        for (var reqFeature : requestedCarFeatures) {
            CarFeature feature = resolveOrCreateFeature(reqFeature);

            // Checks if such feature is already linked to a specific car
            boolean isLinked = car.getFeatureLinks().stream()
                            .anyMatch(link -> link.getCarFeature().getCarFeatureId()
                            .equals(feature.getCarFeatureId()));
            if(isLinked) continue;

            var newLink = new CarToFeatureLink();
            newLink.setCar(car);
            newLink.setCarFeature(feature);

            // If the feature is of the same dictionaryType as the one already linked -> then delete and add new one
            // Remember the hash for linkedFeature is computed based on carId and dictionaryTypeId
            Short dictId = feature.getDictionary().getCarFeatureDictionaryId();
            car.getFeatureLinks().removeIf(link ->
                    link.getCarFeature()
                            .getDictionary()
                            .getCarFeatureDictionaryId()
                            .equals(dictId)
            );

            car.getFeatureLinks().add(newLink);
        }
    }

    private void checkDuplicateFeatureTypes(List<CarFeature> requestedCarFeatures) throws BadRequestException
    {
        var seen = new HashSet<Short>();

        for(var reqFeature : requestedCarFeatures) {
            Short dictId = reqFeature.getDictionary().getCarFeatureDictionaryId();
            if(!seen.add(dictId)) throw new BadRequestException("Duplicate dictionary type with id " +dictId + " found.");
        }
    }
}


