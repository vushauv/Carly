package pw.react.backend.services.car;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarFeatureDictionary;
import pw.react.backend.domain.car.CarToFeatureLink;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.domain.enums.CarAvailabilityStatus;
import pw.react.backend.dto.request.car.CarSearchParams;
import pw.react.backend.dto.request.car.DateRange;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.booking.BookingRepository;
import pw.react.backend.repositories.car.CarFeatureDictionaryRepository;
import pw.react.backend.repositories.car.CarFeatureRepository;
import pw.react.backend.repositories.car.CarRepository;
import pw.react.backend.services.car.model.CarSearchCriteria;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@Slf4j
@RequiredArgsConstructor
public class CarService implements ICarService {

    private final CarRepository carRepository;
    private final CarFeatureRepository carFeatureRepository;
    private final CarFeatureDictionaryRepository carFeatureDictionaryRepository;
    private final BookingRepository bookingRepository;

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

    @Override
    public Car getById(Integer carId) throws ResourceNotFoundException
    {
        var car = carRepository.findByIdWithFeatures(carId);
        return car.orElseThrow(() -> new ResourceNotFoundException("Car with id " + carId + " was not found."));
    }

    // TODO: refactor
    @Override
    public List<Car> getAll(CarSearchCriteria searchCriteria) throws BadRequestException
    {
        var dateRange = searchCriteria.getDateRange();
        boolean hasDate = dateRange != null && dateRange.getTo() != null;

        List<Integer> availableCarIds = null;
        if(hasDate)
        {
            availableCarIds = this.searchCarsByAvailability(searchCriteria);
            if(availableCarIds.isEmpty())
                return List.of();
            if(searchCriteria.getCarFeatures() == null || searchCriteria.getCarFeatures().isEmpty())
                return carRepository.findByCarIdInOrderByCarIdAsc(availableCarIds);
        }

        if(searchCriteria.getCarFeatures() == null || searchCriteria.getCarFeatures().isEmpty())
            return carRepository.findAllByOrderByCarIdAsc();

        var filteredCarIds = this.searchCarsByFeatures(searchCriteria, availableCarIds);
        if(filteredCarIds.isEmpty()) return List.of();

        return carRepository.findByCarIdInOrderByCarIdAsc(filteredCarIds);
    }

    @Override
    public List<Car> getPage(int page, int size, CarSearchCriteria searchCriteria)
            throws BadRequestException
    {
        int defaultPageSize = 10;
        int pageSize = (size <= 0) ? defaultPageSize : size;

        var dateRange = searchCriteria.getDateRange();
        boolean hasDate = dateRange != null && dateRange.getTo() != null;

        List<Integer> availableCarIds = null;
        if(hasDate)
        {
            availableCarIds = this.searchCarsByAvailability(searchCriteria);
            if(availableCarIds.isEmpty())
                return List.of();
            if(searchCriteria.getCarFeatures() == null || searchCriteria.getCarFeatures().isEmpty())
                return carRepository.findByCarIdInOrderByCarIdAsc(availableCarIds, PageRequest.of(page, pageSize)).getContent();
        }

        if(searchCriteria.getCarFeatures() == null || searchCriteria.getCarFeatures().isEmpty())
            return carRepository.findAllByOrderByCarIdAsc(PageRequest.of(page, pageSize)).getContent();

        var filteredCarIds = this.searchCarsByFeatures(searchCriteria, availableCarIds);
        if(filteredCarIds.isEmpty()) return List.of();

        return carRepository.findByCarIdInOrderByCarIdAsc(filteredCarIds, PageRequest.of(page, pageSize)).getContent();
    }

    private DateRange normaliseDates(DateRange dateRange)
        throws BadRequestException
    {
        var from = dateRange.getFrom();
        var to = dateRange.getTo();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        if (from == null || from.isBefore(todayStart)) from = todayStart;
        if (!to.isAfter(from)) throw new BadRequestException("'to' must be after 'from'");
        return new DateRange(from, to);
    }

    private List<Integer> searchCarsByFeatures(CarSearchCriteria searchCriteria,
                                               List<Integer> availableCarIds)
            throws BadRequestException
    {
        var requestedCarFeatures = searchCriteria.getCarFeatures();
        // Resolves dictionary Types
        var typedFeatures = resolveFeatureTypesByName(requestedCarFeatures);
        // Checks for duplicates in query params
        this.checkDuplicateFeatureTypes(typedFeatures);

        int initialCount = requestedCarFeatures.size();
        var resolved = resolveFeature(typedFeatures);
        int resolvedCount = resolved.size();

        // if some features were not found - then no such car exists
        if(resolvedCount != initialCount) return List.of();

        if(availableCarIds != null) {
            return carRepository.findCarIdsMatchingAllFeaturesWithin(
                    availableCarIds,
                    resolved,
                    resolvedCount);
        }else{
            return carRepository.findCarIdsMatchingAllFeatures(
                    resolved,
                    resolvedCount);
        }
    }


    private List<Integer> searchCarsByAvailability(CarSearchCriteria searchCriteria)
        throws BadRequestException
    {
        var dateRange = this.normaliseDates(searchCriteria.getDateRange());
        var from = dateRange.getFrom();
        var to = dateRange.getTo();

        if(searchCriteria.getAvailabilityStatus().equals(CarAvailabilityStatus.AVAILABLE))
            return carRepository.filterAvailableCarIds(
                from,
                to,
                BookingStatus.CANCELLED.getCode());
        else
            return carRepository.filterRentedCarIds(
                    from,
                    to,
                    BookingStatus.CANCELLED.getCode());

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
            var dictId = reqFeature.getDictionary().getCarFeatureDictionaryId();
            var name = reqFeature.getDictionary().getName();
            if(!seen.add(dictId)) throw new BadRequestException("Duplicate feature type with id " +dictId + " and name " + name + " found.");
        }
    }

    private List<CarFeature> resolveFeatureTypesByName(List<CarFeature> requestedCarFeatures) throws IllegalArgumentException
    {
        // The filtering is client-side because the number of distinct feature types is small
        Set<String> names = requestedCarFeatures
                .stream()
                .map(f -> f.getDictionary().getName())
                .collect(Collectors.toSet());

        Map<String, CarFeatureDictionary> dictionaryMap =
                carFeatureDictionaryRepository.findByNameIn(names)
                .stream()
                .collect(Collectors.toMap(CarFeatureDictionary::getName, dictionary -> dictionary));

        for (var feature : requestedCarFeatures) {
            var dictId = feature.getDictionary().getCarFeatureDictionaryId();
            var name = feature.getDictionary().getName();
            var resolved = dictionaryMap.get(name);
            if (resolved == null) {
                throw new IllegalArgumentException("Unknown feature type with name " + name);
            }
            feature.setDictionary(resolved);
        }
        return requestedCarFeatures;
    }

    private List<CarFeature> resolveFeature(List<CarFeature> requestedCarFeatures)
    {
        // has M+1 query problem: likely inefficient.
        // TODO: refactor
        var resolvedList = new ArrayList<CarFeature>();
        for(var feature: requestedCarFeatures) {
            var dictId = feature.getDictionary().getCarFeatureDictionaryId();
            var resolved = carFeatureRepository.findFeatureBy(dictId, feature.getValue());
            resolved.ifPresent(resolvedList::add);
        }
        return resolvedList;
    }
}


