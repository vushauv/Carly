package pw.react.backend.services.car;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import pw.react.backend.domain.car.*;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.domain.enums.CarAvailabilityStatus;
import pw.react.backend.dto.models.DateRange;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.car.*;
import pw.react.backend.repositories.car.models.CarImageUrlRow;
import pw.react.backend.services.car.model.CarSearchCriteria;
import pw.react.backend.utils.DateUtils;
import pw.react.backend.utils.converters.response.DisplayNameConverter;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;


@Service
@Slf4j
@RequiredArgsConstructor
// TODO: Consider decomposing a service into multiple classes
// TODO: Add Rating Service, which would be responsible for assigning ratings to cars
public class CarMainService implements CarService {

    private final CarRepository carRepository;
    private final CarFeatureRepository carFeatureRepository;
    private final CarFeatureDictionaryRepository carFeatureDictionaryRepository;
    private final CarImageRepository carImageRepository;

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
    public Car update(Car updatedCar, List<CarFeature> requestedCarFeatures) throws ResourceNotFoundException, BadRequestException
    {
        Car car = carRepository.findByIdWithFeatures(updatedCar.getCarId()).orElseThrow(() ->
                new ResourceNotFoundException("Car with id " + updatedCar.getCarId() + " was not found."));

        checkDuplicateFeatureTypes(requestedCarFeatures);
        linkFeatures(car, requestedCarFeatures);
        car.setPrice(updatedCar.getPrice());
        return carRepository.save(car);
    }

    @Override
    @Transactional
    public Car create(Car createdCar, List<CarFeature> requestedCarFeatures) throws ResourceNotFoundException, BadRequestException
    {
        Car car = new Car();
        car.setPrice(createdCar.getPrice());
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
    public List<Car> getAll(CarSearchCriteria searchCriteria)
            throws BadRequestException
    {
        // Validate price range
        this.validatePrice(searchCriteria.getMinPrice(), searchCriteria.getMaxPrice());

        var dateRange = searchCriteria.getDateRange();
        boolean hasDate = dateRange != null && dateRange.getTo() != null;

        List<Integer> availableCarIds = null;
        if(hasDate)
        {
            availableCarIds = this.searchCarsByAvailability(searchCriteria);
            if(availableCarIds.isEmpty())
                return List.of();
            if(searchCriteria.getCarFeatures() == null || searchCriteria.getCarFeatures().isEmpty())
                return filterByPrice(
                        carRepository.findByCarIdInOrderByCarIdAsc(availableCarIds),
                        searchCriteria);
        }

        if(searchCriteria.getCarFeatures() == null || searchCriteria.getCarFeatures().isEmpty())
            return filterByPrice(carRepository.findAllByOrderByCarIdAsc(), searchCriteria);

        var filteredCarIds = this.searchCarsByFeatures(searchCriteria, availableCarIds);
        if(filteredCarIds.isEmpty()) return List.of();

        return filterByPrice(
                carRepository.findByCarIdInOrderByCarIdAsc(filteredCarIds),
                searchCriteria);
    }

    @Override
    public List<Car> getPage(int page, int size, CarSearchCriteria searchCriteria)
            throws BadRequestException
    {
        int defaultPageSize = 10;
        int pageSize = (size <= 0) ? defaultPageSize : size;

        // Validate price range
        this.validatePrice(searchCriteria.getMinPrice(), searchCriteria.getMaxPrice());

        var dateRange = searchCriteria.getDateRange();
        boolean hasDate = dateRange != null && dateRange.getTo() != null;

        List<Integer> availableCarIds = null;
        if(hasDate)
        {
            availableCarIds = this.searchCarsByAvailability(searchCriteria);
            if(availableCarIds.isEmpty())
                return List.of();

            if(searchCriteria.getCarFeatures() == null || searchCriteria.getCarFeatures().isEmpty())
                return filterByPrice(
                        carRepository.findByCarIdInOrderByCarIdAsc(availableCarIds, PageRequest.of(page, pageSize)).getContent(),
                        searchCriteria);
        }

        if(searchCriteria.getCarFeatures() == null || searchCriteria.getCarFeatures().isEmpty())
            return filterByPrice(
                    carRepository.findAllByOrderByCarIdAsc(PageRequest.of(page, pageSize)).getContent(),
                    searchCriteria);

        var filteredCarIds = this.searchCarsByFeatures(searchCriteria, availableCarIds);
        if(filteredCarIds.isEmpty()) return List.of();

        return filterByPrice(
                carRepository.findByCarIdInOrderByCarIdAsc(filteredCarIds, PageRequest.of(page, pageSize)).getContent(),
                searchCriteria);
    }

    public boolean checkCarAvailability(Integer carId,Integer bookingId,DateRange dateRange)
            throws ResourceNotFoundException
    {
        if(!carRepository.existsById(carId))
            throw new ResourceNotFoundException("Car with id " + carId + " was not found.");
        var res = carRepository.checkCarAvailability(carId,
                bookingId,
                dateRange.getFrom(), dateRange.getTo(),
                BookingStatus.CANCELLED.getCode());

        return res.isPresent();
    }

    private List<Car> filterByPrice(List<Car> cars, CarSearchCriteria searchCriteria)
    {
        var min = searchCriteria.getMinPrice();
        var max = searchCriteria.getMaxPrice();
        if(min == null && max == null) return cars;

        return cars.stream()
                .filter(c -> {
                    var price = c.getPrice();
                    if(price == null) return false;
                    if(min != null && price.compareTo(min) < 0) return false;
                    if(max != null && price.compareTo(max) > 0) return false;
                    return true;
                })
                .collect(Collectors.toList());
    }

    // Method to be used to calculate the total price of the car on the booking
    public BigDecimal calculateTotalPrice(Car car, DateRange dateRange)
        throws ResourceNotFoundException
    {
        Car managedCar = carRepository.findById(car.getCarId())
                .orElseThrow(() -> new ResourceNotFoundException("Car with id " + car.getCarId() + " was not found."));

        var price = managedCar.getPrice();
        return price == null ? null : price.multiply(BigDecimal.valueOf(this.calculateDayDifference(dateRange)));
    }

    public Map<Integer, List<Integer>> linkCarImages(List<Car> cars)
    {
        var carIds = cars.stream().map(Car::getCarId).toList();
        if (carIds.isEmpty()) return Map.of();

        return carImageRepository.findImageByCarIds(carIds).stream()
                .collect(Collectors.groupingBy(CarImageUrlRow::getCarId,
                        Collectors.mapping(CarImageUrlRow::getImageId, Collectors.toList())));

    }

    private void validatePrice(BigDecimal minPrice, BigDecimal maxPrice)
            throws BadRequestException
    {
        if(minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0)
            throw new BadRequestException("minPrice cannot be greater than maxPrice");
    }

    private long calculateDayDifference(DateRange dateRange)
    {
        // Computes a ceiling - if a days is touched - counts as till the end of the day
        return DateUtils.calculateDayDifference(dateRange.getFrom(), dateRange.getTo()) + 1;
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
        var dateRange = DateUtils.validateAndNormalise(searchCriteria.getDateRange());
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
            var mappedName = DisplayNameConverter.fromDisplayName(feature.getValue());
            var resolved = carFeatureRepository.findFeatureBy(dictId, mappedName);
            resolved.ifPresent(resolvedList::add);
        }
        return resolvedList;
    }
}


