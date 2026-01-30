package pw.react.backend.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.Location;
import pw.react.backend.domain.car.CarFeature;
import pw.react.backend.domain.car.CarFeatureDictionary;
import pw.react.backend.domain.car.CarToFeatureLink;
import pw.react.backend.domain.enums.*;
import pw.react.backend.domain.user.User;
import pw.react.backend.domain.user.UserTypeDictionary;
import pw.react.backend.repositories.LocationRepository;
import pw.react.backend.repositories.booking.BookingRepository;
import pw.react.backend.repositories.car.CarFeatureDictionaryRepository;
import pw.react.backend.repositories.car.CarFeatureRepository;
import pw.react.backend.repositories.car.CarRepository;
import pw.react.backend.repositories.user.UserRepository;
import pw.react.backend.repositories.user.UserTypeDictionaryRepository;
import pw.react.backend.repositories.booking.BookingStatusDictionaryRepository;
import pw.react.backend.utils.converters.out.DisplayNameConverter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

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
    private final BookingStatusDictionaryRepository bookingStatusDictionaryRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("DataSeeder running. Active profiles: {}", String.join(",", args.getSourceArgs()));

        // 1) Locations
        Location warsawCentral = upsertLocation("Warsaw Central", new BigDecimal("52.2297"), new BigDecimal("21.0122"));
        Location krakowMain = upsertLocation("Krakow Main", new BigDecimal("50.0647"), new BigDecimal("19.9450"));
        Location gdanskOldTown = upsertLocation("Gdansk Old Town", new BigDecimal("54.3520"), new BigDecimal("18.6466"));

        // ===============================================================================================
        //                                  Booking statuses
        // ===============================================================================================
        BookingStatusDictionary created =
                upsertBookingStatus(BookingStatus.CREATED.name(),
                        DisplayNameConverter.toDisplayName(BookingStatus.CREATED.name()),
                        "Booking created");

        BookingStatusDictionary completed =
                upsertBookingStatus(BookingStatus.COMPLETED.name(),
                        DisplayNameConverter.toDisplayName(BookingStatus.COMPLETED.name()),
                        "Booking completed");

        BookingStatusDictionary cancelled =
                upsertBookingStatus(BookingStatus.CANCELLED.name(),
                        DisplayNameConverter.toDisplayName(BookingStatus.CANCELLED.name()),
                        "Booking cancelled");

        // ===============================================================================================
        //                                  Users & UserTypes
        // ===============================================================================================

        upsertUserType(UserRole.CUSTOMER.name(),
                DisplayNameConverter.toDisplayName(UserRole.CUSTOMER.name()),
                "Standard end user");
        upsertUserType(UserRole.SYSTEM.name(),
                DisplayNameConverter.toDisplayName(UserRole.SYSTEM.name()),
                "System / integration user");
        upsertUserType(UserRole.SUPER_ADMIN.name(),
                DisplayNameConverter.toDisplayName(UserRole.SUPER_ADMIN.name()),
                "All permissions");
        upsertUserType(UserRole.ADMIN.name(),
                DisplayNameConverter.toDisplayName(UserRole.ADMIN.name()),
                "Administrative user");

        UserTypeDictionary superAdminType = userTypeDictionaryRepository.findByName(UserRole.SUPER_ADMIN.name())
                .orElseThrow(() -> new IllegalStateException(UserRole.SUPER_ADMIN.name() + " user type missing"));
        UserTypeDictionary systemType = userTypeDictionaryRepository.findByName(UserRole.SYSTEM.name())
                .orElseThrow(() -> new IllegalStateException(UserRole.SYSTEM.name() + " user type missing"));
        UserTypeDictionary customerType = userTypeDictionaryRepository.findByName(UserRole.CUSTOMER.name())
                .orElseThrow(() -> new IllegalStateException(UserRole.CUSTOMER.name() + " user type missing"));
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
        User customer = upsertUserByEmail(
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


        // 3) Car Feature Dictionaries
        CarFeatureDictionary fuelType = upsertCarFeatureDictionary(CarFeatureType.FUEL_TYPE.name());
        CarFeatureDictionary brand = upsertCarFeatureDictionary(CarFeatureType.BRAND.name());
        CarFeatureDictionary color = upsertCarFeatureDictionary(CarFeatureType.COLOR.name());
        CarFeatureDictionary status = upsertCarFeatureDictionary(CarFeatureType.STATUS.name());
        CarFeatureDictionary model = upsertCarFeatureDictionary(CarFeatureType.MODEL.name());

        // 4) Car feature values (canonical, shared)
        CarFeature fuelGas = upsertCarFeature(fuelType, CarFuelType.GAS.name());
        CarFeature fuelDiesel = upsertCarFeature(fuelType, CarFuelType.DIESEL.name());
        CarFeature fuelElectric = upsertCarFeature(fuelType, CarFuelType.ELECTRIC.name());
        CarFeature fuelHybrid = upsertCarFeature(fuelType, CarFuelType.HYBRID.name());

        // Dynamic letters
        CarFeature brandBmw = upsertCarFeature(brand, "BMW");
        CarFeature brandAudi = upsertCarFeature(brand, "AUDI");
        CarFeature brandToyota = upsertCarFeature(brand, "TOYOTA");

        CarFeature colorBlack = upsertCarFeature(color, "BLACK");
        CarFeature colorWhite = upsertCarFeature(color, "WHITE");
        CarFeature colorRed = upsertCarFeature(color, "RED");

        CarFeature statusActive = upsertCarFeature(status, CarStatus.ACTIVE.name());
        CarFeature statusInactive = upsertCarFeature(status, CarStatus.INACTIVE.name());
        CarFeature statusUnderRepair = upsertCarFeature(status, CarStatus.UNDER_REPAIR.name());

        CarFeature modelSeries3 = upsertCarFeature(model, "SERIES_3");
        CarFeature modelA4 = upsertCarFeature(model, "A4");
        CarFeature modelCorolla = upsertCarFeature(model, "COROLLA");

        // 5) Cars (no natural key -> just ensure a few exist)
        ensureCarsExist(5);

        // 6) Attach features to cars
        attachFeaturesToCars(
                List.of(
                        fuelGas, brandBmw, modelSeries3, colorBlack, statusActive
                ),
                List.of(
                        fuelDiesel, brandAudi, modelA4, colorWhite, statusInactive
                ),
                List.of(
                        fuelElectric, brandToyota, modelCorolla, colorRed, statusUnderRepair
                )
        );

        // 7) Adding car bookings
        Car car1 = carRepository.findById(1)
                .orElseThrow(() -> new IllegalStateException("Car 1 missing"));
        Car car2 = carRepository.findById(2)
                .orElseThrow(() -> new IllegalStateException("Car 2 missing"));
        Car car3 = carRepository.findById(3)
                .orElseThrow(() -> new IllegalStateException("Car 3 missing"));
        Car car4 = carRepository.findById(4)
                .orElseThrow(() -> new IllegalStateException("Car 4 missing"));
        Car car5 = carRepository.findById(5)
                .orElseThrow(() -> new IllegalStateException("Car 5 missing"));
        var todayStart = java.time.LocalDate.now().atStartOfDay();
        //CREATED booking in the future
        bookingRepository.save(makeBooking(
                customer,
                car2,
                cancelled,
                todayStart,
                todayStart.plusDays(1)
        ));

        // CAR 3: COMPLETED booking overlapping tomorrow -> +3 (blocks)
        bookingRepository.save(makeBooking(
                customer,
                car3,
                completed,
                todayStart.plusDays(1),
                todayStart.plusDays(3)
        ));

        // CAR 4: CREATED booking in the future (blocks future availability)
        bookingRepository.save(makeBooking(
                customer,
                car4,
                created,
                todayStart.plusDays(2),
                todayStart.plusDays(5)
        ));

        // CAR 5: past booking only (should not affect availability)
        bookingRepository.save(makeBooking(
                customer,
                car5,
                completed,
                todayStart.minusDays(10),
                todayStart.minusDays(7)
        ));
        log.info("DataSeeder finished.");
    }

    private Booking makeBooking(
            User user,
            Car car,
            BookingStatusDictionary carBookingStatus,
            java.time.LocalDateTime from,
            java.time.LocalDateTime to
    ) {
        Booking b = new Booking();
        b.setUser(user);
        b.setCar(car);
        // allowed optional
        b.setCarBookingStatus(carBookingStatus);
        b.setCarBookingDateFrom(from);
        b.setCarBookingDateTo(to);
        b.setEnabled(true);
        return b;
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

    private void ensureCarsExist(int targetCount) {
        long current = carRepository.count();
        if (current >= targetCount) {
            return;
        }

        int toCreate = (int) (targetCount - current);
        for (int i = 0; i < toCreate; i++) {
            Car c = new Car();
            double randomPrice = ThreadLocalRandom.current().nextDouble(100.0, 500.0);
            BigDecimal price = BigDecimal.valueOf(randomPrice).setScale(2, RoundingMode.HALF_UP);
            c.setPrice(price);
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
