package pw.react.backend.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.Location;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarFeatureDictionary;
import pw.react.backend.domain.car.CarToFeatureLink;
import pw.react.backend.domain.user.UserTypeDictionary;
import pw.react.backend.repositories.LocationRepository;
import pw.react.backend.repositories.car.CarFeatureDictionaryRepository;
import pw.react.backend.repositories.car.CarFeatureRepository;
import pw.react.backend.repositories.car.CarRepository;
import pw.react.backend.repositories.user.UserRepository;
import pw.react.backend.repositories.user.UserTypeDictionaryRepository;
import pw.react.backend.repositories.booking.BookingStatusDictionaryRepository;
import java.math.BigDecimal;
import pw.react.backend.domain.user.User;

import java.util.List;

@Slf4j
@Component
@Profile({"mysql", "batch"})
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserTypeDictionaryRepository userTypeDictionaryRepository;
    private final CarRepository carRepository;
    private final LocationRepository locationRepository;
    private final BookingStatusDictionaryRepository bookingStatusDictionaryRepository;
    private final UserRepository userRepository;
    private final CarFeatureRepository carFeatureRepository;
    private final CarFeatureDictionaryRepository carFeatureDictionaryRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("DataSeeder running. Active profiles: {}", String.join(",", args.getSourceArgs()));

        // 1) Locations
        upsertLocation("Warsaw Central", new BigDecimal("52.2297"), new BigDecimal("21.0122"));
        upsertLocation("Krakow Main", new BigDecimal("50.0647"), new BigDecimal("19.9450"));
        upsertLocation("Gdansk Old Town", new BigDecimal("54.3520"), new BigDecimal("18.6466"));

        // ===============================================================================================
        //                                  Booking statuses
        // ===============================================================================================
        BookingStatusDictionary created =
                upsertBookingStatus("CREATED", "Created", "Booking created");

        BookingStatusDictionary cancelled =
                upsertBookingStatus("CANCELLED", "Cancelled", "Booking cancelled");

        BookingStatusDictionary completed =
                upsertBookingStatus("COMPLETED", "Completed", "Booking completed");

        // ===============================================================================================
        //                                  Users & UserTypes
        // ===============================================================================================

        upsertUserType("CUSTOMER", "Customer", "Standard end user");
        upsertUserType("SYSTEM", "System", "System / integration user");
        upsertUserType("SUPER_ADMIN", "Super Admin", "All permissions");
        upsertUserType("ADMIN", "Admin", "Administrative user");

        UserTypeDictionary superAdminType = userTypeDictionaryRepository.findByName("SUPER_ADMIN")
                .orElseThrow(() -> new IllegalStateException("SUPER_ADMIN user type missing"));
        UserTypeDictionary systemType = userTypeDictionaryRepository.findByName("SYSTEM")
                .orElseThrow(() -> new IllegalStateException("SYSTEM user type missing"));
        UserTypeDictionary customerType = userTypeDictionaryRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new IllegalStateException("CUSTOMER user type missing"));
        // 1) Systems
        upsertUserByEmail(
                "carly@pw.edu.pl",
                "Carly",
                "System",
                systemType,
                null,
                null
        );
        upsertUserByEmail(
                "parkly@pw.edu.pl",
                "Parkly",
                "System",
                systemType,
                null,
                null
        );
        upsertUserByEmail(
                "flatly@pw.edu.pl",
                "Flatly",
                "System",
                systemType,
                null,
                null
        );
        // 2) SuperAdmins
        upsertUserByEmail(
                "oleh.shuptar.stud@pw.edu.pl",
                "Oleh",
                "Shuptar",
                superAdminType,
                null,
                111111111L
        );
        upsertUserByEmail(
                "vasili.vushau.stud@pw.edu.pl",
                "Vasili",
                "Vushau",
                superAdminType,
                null,
                222222222L
        );
        upsertUserByEmail(
                "stanislaw.zielinski.stud@pw.edu.pl",
                "Stanisław",
                "Zieliński",
                superAdminType,
                null,
                333333333L
        );
        upsertUserByEmail(
                "wojciech.sendek.stud@pw.edu.pl",
                "Wojtek",
                "Sendek",
                superAdminType,
                "ass",
                444444444L
        );
        // 3) Example customers (to avoid FK mistakes when creating test data)
        upsertUserByEmail(
                "DT@family.com",
                "Dominic",
                "Toretto",
                customerType,
                null,
                987654321L
        );
        upsertUserByEmail(
                "BB@shire.gov",
                "Bilbo",
                "Baggins",
                customerType,
                null,
                999999999L
        );
        upsertUserByEmail(
                "JS@blackpearl.org",
                "Jack",
                "Sparrow",
                customerType,
                null,
                123456789L
        );
        // 2) Locations
        upsertLocation("Warsaw Central", new BigDecimal("52.2297"), new BigDecimal("21.0122"));
        upsertLocation("Krakow Main", new BigDecimal("50.0647"), new BigDecimal("19.9450"));
        upsertLocation("Gdansk Old Town", new BigDecimal("54.3520"), new BigDecimal("18.6466"));

        // 3) Car Feature Dictionaries
        CarFeatureDictionary fuelType = upsertCarFeatureDictionary("FUEL_TYPE");
        CarFeatureDictionary brand = upsertCarFeatureDictionary("BRAND");
        CarFeatureDictionary color = upsertCarFeatureDictionary("COLOR");
        CarFeatureDictionary status = upsertCarFeatureDictionary("STATUS");
        CarFeatureDictionary model = upsertCarFeatureDictionary("MODEL");

        // 4) Car feature values (canonical, shared)
        CarFeature fuelGas = upsertCarFeature(fuelType, "GAS");
        CarFeature fuelDiesel = upsertCarFeature(fuelType, "DIESEL");
        CarFeature fuelElectric = upsertCarFeature(fuelType, "ELECTRIC");

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

        ensureCarsExist(3);
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
    private BookingStatusDictionary upsertBookingStatus(
            String name,
            String displayName,
            String description
    ) {
        BookingStatusDictionary e =
                bookingStatusDictionaryRepository.findByName(name)
                        .orElseGet(BookingStatusDictionary::new);

        e.setName(name);
        e.setDisplayName(displayName);
        e.setDescription(description);
        e.setEnabled(true);

        return bookingStatusDictionaryRepository.save(e);
    }
    private User upsertUserByEmail(
            String email,
            String firstName,
            String lastName,
            UserTypeDictionary userType,
            String password,
            Long contactNumber
    ) {
        User u = userRepository.findByEmail(email).orElseGet(User::new);

        u.setEmail(email);
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setUserType(userType);

        // optional fields
        u.setPassword(password);
        u.setContactNumber(contactNumber);

        // audit flag
        u.setEnabled(true);

        return userRepository.save(u);
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
}
