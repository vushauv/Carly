package pw.react.backend.services.car;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarToFeatureLink;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.car.CarFeatureDictionaryRepository;
import pw.react.backend.repositories.car.CarFeatureRepository;
import pw.react.backend.repositories.car.CarRepository;
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
    public void delete(Integer id) throws ResourceNotFoundException {
        Car car = carRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Company with id " + id + " was not found."));
        car.setEnabled(false); // setting the isEnabled flag to false indicates deletion of the object
        log.info("Company with id {} has been deleted.", id);
    }

    @Override
    @Transactional
    public Car update(Integer id, List<CarFeature> requestedCarFeatures) throws ResourceNotFoundException {
        Car car = carRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Company with id " + id + " was not found."));

        car.getFeatureLinks().clear();
        linkFeatures(car, requestedCarFeatures);
        return carRepository.save(car);
    }

    // TODO: Enforce uniqueness on DictionaryId and Value
    @Override
    @Transactional
    public Car create(List<CarFeature> requestedCarFeatures) {
        Car car = new Car();
        linkFeatures(car, requestedCarFeatures);
        return carRepository.save(car);
    }

    // TODO: Add filtering here
    @Override
    public List<Car> getAll() {
        return carRepository.findByEnabledTrue();
    }

    @Override
    public Car getById(Integer carId) throws ResourceNotFoundException {
        var car = carRepository.findByIdWithFeatures(carId);
        return car.orElseThrow(() -> new ResourceNotFoundException("Company with id " + carId + " was not found."));
    }

    @Override
    public List<Car> getPage(int page, int size) {
        int defaultPageSize = 10;
        return carRepository.findAll(PageRequest.of(page, size == 0 ? defaultPageSize : size)).getContent();
    }

    private CarFeature resolveOrCreateFeature(CarFeature req) {
        return carFeatureRepository.findFeatureBy(
                req.getDictionary().getCarFeatureDictionaryId(),
                req.getValue(),
                req.getValueName()
        ).orElseGet(() -> {
            CarFeature created = new CarFeature();

            var dictRef = carFeatureDictionaryRepository
                    .getReferenceById(req.getDictionary().getCarFeatureDictionaryId());

            created.setDictionary(dictRef);
            created.setValue(req.getValue());
            created.setValueName(req.getValueName());
            created.setValueDisplayName(req.getValueDisplayName());
            created.setDescription(req.getDescription());

            return carFeatureRepository.save(created);
        });
    }

    private void linkFeatures(Car car, List<CarFeature> requestedCarFeatures) {
        for (CarFeature req : requestedCarFeatures) {
            CarFeature feature = resolveOrCreateFeature(req);

            boolean isLinked = car.getFeatureLinks().stream()
                    .anyMatch(l -> l.getCarFeature().getCarFeatureId().equals(feature.getCarFeatureId()));

            if (!isLinked) {
                CarToFeatureLink link = new CarToFeatureLink();
                link.setCar(car);
                link.setCarFeature(feature);
                car.getFeatureLinks().add(link);
            }
        }
    }
}
