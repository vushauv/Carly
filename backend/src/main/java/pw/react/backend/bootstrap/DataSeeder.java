package pw.react.backend.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.Location;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarFeatureDictionary;
import pw.react.backend.domain.car.CarToFeatureLink;
import pw.react.backend.domain.enums.CarFeatureType;
import pw.react.backend.domain.enums.CarFuelType;
import pw.react.backend.domain.enums.UserRole;
import pw.react.backend.domain.user.UserTypeDictionary;
import pw.react.backend.repositories.LocationRepository;
import pw.react.backend.repositories.car.CarFeatureDictionaryRepository;
import pw.react.backend.repositories.car.CarFeatureRepository;
import pw.react.backend.repositories.car.CarRepository;
import pw.react.backend.repositories.user.UserTypeDictionaryRepository;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@Profile({"mysql", "batch"})
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserTypeDictionaryRepository userTypeDictionaryRepository;
    private final CarRepository carRepository;
    private final LocationRepository locationRepository;
    private final CarFeatureRepository carFeatureRepository;
    private final CarFeatureDictionaryRepository carFeatureDictionaryRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("DataSeeder running. Active profiles: {}", String.join(",", args.getSourceArgs()));


        // 1) User types
        upsertUserType(UserRole.CUSTOMER.getValue(), "Customer", "Standard end user");
        upsertUserType(UserRole.SYSTEM.getValue(), "System", "System / integration user");
        upsertUserType(UserRole.SUPER_ADMIN.getValue(), "Super Admin", "All permissions");
        upsertUserType(UserRole.ADMIN.getValue(), "Admin", "Administrative user");

        // 2) Locations
        upsertLocation("Warsaw Central", new BigDecimal("52.2297"), new BigDecimal("21.0122"));
        upsertLocation("Krakow Main", new BigDecimal("50.0647"), new BigDecimal("19.9450"));
        upsertLocation("Gdansk Old Town", new BigDecimal("54.3520"), new BigDecimal("18.6466"));

        // 3) Car Feature Dictionaries
        CarFeatureDictionary fuelType = upsertCarFeatureDictionary(CarFeatureType.FUEL_TYPE.getValue());
        CarFeatureDictionary brand = upsertCarFeatureDictionary(CarFeatureType.BRAND.getValue());
        CarFeatureDictionary color = upsertCarFeatureDictionary(CarFeatureType.COLOR.getValue());
        CarFeatureDictionary status = upsertCarFeatureDictionary(CarFeatureType.STATUS.getValue());
        CarFeatureDictionary model = upsertCarFeatureDictionary(CarFeatureType.MODEL.getValue());

        // 4) Car feature values (canonical, shared)
        CarFeature fuelGas = upsertCarFeature(fuelType, CarFuelType.GAS.getValue());
        CarFeature fuelDiesel = upsertCarFeature(fuelType, CarFuelType.DIESEL.getValue());
        CarFeature fuelElectric = upsertCarFeature(fuelType, CarFuelType.ELECTRIC.getValue());
        CarFeature fuelHybrid = upsertCarFeature(fuelType, CarFuelType.HYBRID.getValue());

        CarFeature brandBmw = upsertCarFeature(brand, "BMW");
        CarFeature brandAudi = upsertCarFeature(brand, "AUDI");
        CarFeature brandToyota = upsertCarFeature(brand, "TOYOTA");

        CarFeature colorBlack = upsertCarFeature(color, "BLACK");
        CarFeature colorWhite = upsertCarFeature(color, "WHITE");
        CarFeature colorRed = upsertCarFeature(color, "RED");

        CarFeature statusAvailable = upsertCarFeature(status, "AVAILABLE");
        CarFeature statusRented = upsertCarFeature(status, "RENTED");

        CarFeature modelSeries3 = upsertCarFeature(model, "SERIES_3");
        CarFeature modelA4 = upsertCarFeature(model, "A4");
        CarFeature modelCorolla = upsertCarFeature(model, "COROLLA");

        // 5) Cars (no natural key -> just ensure a few exist)
        ensureCarsExist(5);

        // 6) Attach features to cars
        attachFeaturesToCars(
                List.of(
                        fuelGas, brandBmw, modelSeries3, colorBlack, statusAvailable
                ),
                List.of(
                        fuelDiesel, brandAudi, modelA4, colorWhite, statusAvailable
                ),
                List.of(
                        fuelElectric, brandToyota, modelCorolla, colorRed, statusRented
                )
        );
        log.info("DataSeeder finished.");
    }

    private UserTypeDictionary upsertUserType(String name, String displayName, String description) {
        UserTypeDictionary e = userTypeDictionaryRepository.findByName(name)
                .orElseGet(UserTypeDictionary::new);

        e.setName(name);
        e.setDisplayName(displayName);
        e.setDescription(description);

        // audit column
        e.setEnabled(true);


        return userTypeDictionaryRepository.save(e);
    }

    private Location upsertLocation(String locationName, BigDecimal latitude, BigDecimal longitude) {
        Location e = locationRepository.findByLocationName(locationName)
                .orElseGet(Location::new);

        e.setLocationName(locationName);
        e.setLatitude(latitude);
        e.setLongitude(longitude);

        // audit column
        e.setEnabled(true);


        return locationRepository.save(e);
    }

    private void ensureCarsExist(int targetCount) {
        long current = carRepository.count();
        if (current >= targetCount) {
            return;
        }

        int toCreate = (int) (targetCount - current);
        for (int i = 0; i < toCreate; i++) {
            Car c = new Car();
            c.setEnabled(true);
            carRepository.save(c);
        }
    }

    private CarFeatureDictionary upsertCarFeatureDictionary(String name) {
        return carFeatureDictionaryRepository.findByName(name)
                .orElseGet(() -> {
                    CarFeatureDictionary d = new CarFeatureDictionary();
                    d.setName(name);
                    d.setEnabled(true);
                    return carFeatureDictionaryRepository.save(d);
                });
    }

    private CarFeature upsertCarFeature(CarFeatureDictionary dict, String value) {
        return carFeatureRepository
                .findFeatureBy(dict.getCarFeatureDictionaryId(), value)
                .orElseGet(() -> {
                    CarFeature f = new CarFeature();
                    f.setDictionary(dict);
                    f.setValue(value); // categorical
                    f.setEnabled(true);
                    return carFeatureRepository.save(f);
                });
    }

    private void attachFeaturesToCars(List<CarFeature>... featureSets) {
        List<Car> cars = carRepository.findAll();

        for (int i = 0; i < cars.size() && i < featureSets.length; i++) {
            Car car = cars.get(i);

            // clear existing links (since schema is recreated anyway)
            car.getFeatureLinks().clear();

            for (CarFeature feature : featureSets[i]) {
                CarToFeatureLink link = new CarToFeatureLink();
                link.setCar(car);
                link.setCarFeature(feature);
                link.setEnabled(true);
                car.getFeatureLinks().add(link);
            }
            carRepository.save(car);
        }
    }
}
