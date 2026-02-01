package pw.react.backend.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.booking.Location;
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
import pw.react.backend.services.car.CarImageService;
import pw.react.backend.utils.files.bootstrap.MockMultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
@Profile({"mysql", "batch", "azure-mysql"}) //without azure-mysql specified here, I think the DataSeeder will not run on Azure
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
    private final CarImageService carImageService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("DataSeeder running. Active profiles: {}", String.join(",", args.getSourceArgs()));
        this.init();
        this.seedData();
        log.info("DataSeeder finished.");
    }

    // TODO: convert to builder
    // The method used to populate the db with required data
    @Transactional
    public void init()
    {
        // Upset locations
        Location warsawCentral = upsertLocation("Warsaw Central", new BigDecimal("52.2297"), new BigDecimal("21.0122"));
        Location krakowMain = upsertLocation("Krakow Main", new BigDecimal("50.0647"), new BigDecimal("19.9450"));
        Location gdanskOldTown = upsertLocation("Gdansk Old Town", new BigDecimal("54.3520"), new BigDecimal("18.6466"));
        Location warsawChopinAirport = upsertLocation("Warsaw Chopin Airport", new BigDecimal("52.1657"), new BigDecimal("20.9671"));
        Location warsawWest = upsertLocation("Warsaw West Station", new BigDecimal("52.2196"), new BigDecimal("20.9716"));
        Location warsawEast = upsertLocation("Warsaw East Station", new BigDecimal("52.2514"), new BigDecimal("21.0446"));
        Location krakowBalice = upsertLocation("Krakow Balice Airport", new BigDecimal("50.0777"), new BigDecimal("19.7848"));

        // Upsert enums:
        // 1. Booking status:
        BookingStatusDictionary created = upsertBookingStatus(BookingStatus.CREATED.name(), "Booking created");
        BookingStatusDictionary completed = upsertBookingStatus(BookingStatus.COMPLETED.name(), "Booking completed");
        BookingStatusDictionary cancelled = upsertBookingStatus(BookingStatus.CANCELLED.name(), "Booking cancelled");

        // 2. User Role
        upsertUserType(UserRole.CUSTOMER.name(), "Standard end user");
        upsertUserType(UserRole.SYSTEM.name(), "System / integration user");
        upsertUserType(UserRole.SUPER_ADMIN.name(), "All permissions");
        upsertUserType(UserRole.ADMIN.name(), "Administrative user");

        // 3. CarFeatureType
        CarFeatureDictionary color = upsertCarFeatureDictionary(CarFeatureType.COLOR.name());
        CarFeatureDictionary brand = upsertCarFeatureDictionary(CarFeatureType.BRAND.name());
        CarFeatureDictionary fuelType = upsertCarFeatureDictionary(CarFeatureType.FUEL_TYPE.name());
        CarFeatureDictionary model = upsertCarFeatureDictionary(CarFeatureType.MODEL.name());
        CarFeatureDictionary status = upsertCarFeatureDictionary(CarFeatureType.STATUS.name());

        // 4. Fuel Type
        CarFeature fuelGas = upsertCarFeature(fuelType, CarFuelType.GAS.name());
        CarFeature fuelDiesel = upsertCarFeature(fuelType, CarFuelType.DIESEL.name());
        CarFeature fuelElectric = upsertCarFeature(fuelType, CarFuelType.ELECTRIC.name());
        CarFeature fuelHybrid = upsertCarFeature(fuelType, CarFuelType.HYBRID.name());

        // 5. CarStatus
        CarFeature statusActive = upsertCarFeature(status, CarStatus.ACTIVE.name());
        CarFeature statusInactive = upsertCarFeature(status, CarStatus.INACTIVE.name());
        CarFeature statusUnderRepair = upsertCarFeature(status, CarStatus.UNDER_REPAIR.name());

        // 6. System and Admin Users
        addSystemUsers();
        addSuperAdmins();
    }

    @Transactional
    public void addSystemUsers()
    {
        var systemType = userTypeDictionaryRepository.findById((short)UserRole.SYSTEM.getCode());
        if(systemType.isEmpty())
            throw new IllegalStateException("Upsert User Roles first");
        // 1) Systems
        upsertUserByEmail("carly@pw.edu.pl", "Carly", "System", systemType.get(), null, null);
        upsertUserByEmail("parkly@pw.edu.pl", "Parkly", "System", systemType.get(), null, null);
        upsertUserByEmail("flatly@pw.edu.pl", "Flatly", "System", systemType.get(), null, null);
    }

    @Transactional
    public void addSuperAdmins()
    {
        var superAdminType = userTypeDictionaryRepository.findById((short)UserRole.SUPER_ADMIN.getCode());
        if(superAdminType.isEmpty())
            throw new IllegalStateException("Upsert User Roles first");

        upsertUserByEmail("oleh.shuptar.stud@pw.edu.pl", "Oleh", "Shuptar", superAdminType.get(), "pass", 111111111L);
        upsertUserByEmail("vasili.vushau.stud@pw.edu.pl", "Vasili", "Vushau", superAdminType.get(), "pass", 222222222L);
        upsertUserByEmail("stanislaw.zielinski.stud@pw.edu.pl", "Stanisław", "Zieliński", superAdminType.get(), "pass", 333333333L);
        upsertUserByEmail("wojciech.sendek.stud@pw.edu.pl", "Wojtek", "Sendek", superAdminType.get(), "ass", 444444444L);
    }

    @Transactional
    public void seedData()
    {
        var customerType = userTypeDictionaryRepository.findById((short)UserRole.CUSTOMER.getCode());
        if(customerType.isEmpty())
            throw new IllegalStateException("Upsert User Roles first");
        var brand = carFeatureDictionaryRepository.findById((short)CarFeatureType.BRAND.getCode());
        var color = carFeatureDictionaryRepository.findById((short)CarFeatureType.COLOR.getCode());
        var model = carFeatureDictionaryRepository.findById((short)CarFeatureType.MODEL.getCode());
        if(brand.isEmpty() || color.isEmpty() || model.isEmpty())
            throw  new IllegalStateException("Upsert FeatureTypes first");
        var fuelGas = carFeatureRepository.findFeatureBy((short)CarFeatureType.FUEL_TYPE.getCode(),CarFuelType.GAS.name());
        var fuelDiesel = carFeatureRepository.findFeatureBy((short)CarFeatureType.FUEL_TYPE.getCode(),CarFuelType.DIESEL.name());
        var fuelHybrid = carFeatureRepository.findFeatureBy((short)CarFeatureType.FUEL_TYPE.getCode(),CarFuelType.HYBRID.name());
        var fuelElectric = carFeatureRepository.findFeatureBy((short)CarFeatureType.FUEL_TYPE.getCode(),CarFuelType.ELECTRIC.name());
        if(fuelGas.isEmpty() || fuelHybrid.isEmpty() || fuelElectric.isEmpty() || fuelDiesel.isEmpty())
            throw new IllegalStateException("Upsert CarFeatures first");
        var statusInactive = carFeatureRepository.findFeatureBy((short)CarFeatureType.STATUS.getCode(),CarStatus.INACTIVE.name());
        var statusActive = carFeatureRepository.findFeatureBy((short)CarFeatureType.STATUS.getCode(),CarStatus.ACTIVE.name());
        var statusUnderRepair = carFeatureRepository.findFeatureBy((short)CarFeatureType.STATUS.getCode(),CarStatus.UNDER_REPAIR.name());
        if(statusInactive.isEmpty() || statusActive.isEmpty() || statusUnderRepair.isEmpty())
            throw new IllegalStateException("Upsert CarFeatures first");

        // 1. Customers:
        User u1 = upsertUserByEmail("DT@family.com", "Dominic", "Toretto", customerType.get(), "pass", 987654321L);
        User u2 =upsertUserByEmail( "BB@shire.gov", "Bilbo", "Baggins", customerType.get(), "pass", 999999999L);
        User u3 =upsertUserByEmail( "JS@blackpearl.org", "Jack", "Sparrow", customerType.get(), "pass", 123456789L);
        User u4 =upsertUserByEmail( "HP@hogwarts.edu", "Harry", "Potter", customerType.get(), "pass", 111222333L);
        User u5 =upsertUserByEmail( "john.wick@continental.com", "John", "Wick", customerType.get(), "pass", 505050505L);
        User u6 =upsertUserByEmail( "batman@gotham.com", "Bruce", "Wayne", customerType.get(), "pass", 202020202L);
        User u7 =upsertUserByEmail( "walter.white@heisenberg.lab", "Walter", "White", customerType.get(), "pass", 808080808L);
        User u8 =upsertUserByEmail( "neo@matrix.io", "Neo", "Anderson", customerType.get(), "pass", 909090909L);

        // 2. CarFeatures:
        CarFeature brandBmw = upsertCarFeature(brand.get(), "BMW");
        CarFeature brandAudi = upsertCarFeature(brand.get(), "AUDI");
        CarFeature brandToyota = upsertCarFeature(brand.get(), "TOYOTA");
        CarFeature brandMercedes = upsertCarFeature(brand.get(), "MERCEDES");
        CarFeature brandVolkswagen = upsertCarFeature(brand.get(), "VOLKSWAGEN");
        CarFeature brandSkoda = upsertCarFeature(brand.get(), "SKODA");
        CarFeature brandFord = upsertCarFeature(brand.get(), "FORD");
        CarFeature brandRenault = upsertCarFeature(brand.get(), "RENAULT");
        CarFeature brandHyundai = upsertCarFeature(brand.get(), "HYUNDAI");
        CarFeature brandMazda = upsertCarFeature(brand.get(), "MAZDA");
        CarFeature brandNissan = upsertCarFeature(brand.get(), "NISSAN");
        CarFeature brandHonda = upsertCarFeature(brand.get(), "HONDA");
        CarFeature brandTesla = upsertCarFeature(brand.get(), "TESLA");

        CarFeature colorBlack = upsertCarFeature(color.get(), "BLACK");
        CarFeature colorWhite = upsertCarFeature(color.get(), "WHITE");
        CarFeature colorRed = upsertCarFeature(color.get(), "RED");
        CarFeature colorBlue = upsertCarFeature(color.get(), "BLUE");
        CarFeature colorSilver = upsertCarFeature(color.get(), "SILVER");
        CarFeature colorGrey = upsertCarFeature(color.get(), "GREY");
        CarFeature colorBrown = upsertCarFeature(color.get(), "BROWN");
        CarFeature colorBeige = upsertCarFeature(color.get(), "BEIGE");
        CarFeature colorBronze = upsertCarFeature(color.get(), "BRONZE");
        CarFeature colorNavy = upsertCarFeature(color.get(), "NAVY");

        CarFeature modelSeries3 = upsertCarFeature(model.get(), "SERIES_3");
        CarFeature modelA4 = upsertCarFeature(model.get(), "A4");
        CarFeature modelCorolla = upsertCarFeature(model.get(), "COROLLA");
        CarFeature modelCClass = upsertCarFeature(model.get(), "C_CLASS");
        CarFeature modelGolf = upsertCarFeature(model.get(), "GOLF");
        CarFeature modelOctavia = upsertCarFeature(model.get(), "OCTAVIA");
        CarFeature modelFocus = upsertCarFeature(model.get(), "FOCUS");
        CarFeature modelClio = upsertCarFeature(model.get(), "CLIO");
        CarFeature modelI30 = upsertCarFeature(model.get(), "I30");
        CarFeature modelMazda3 = upsertCarFeature(model.get(), "MAZDA_3");
        CarFeature modelQashqai = upsertCarFeature(model.get(), "QASHQAI");
        CarFeature modelCivic = upsertCarFeature(model.get(), "CIVIC");
        CarFeature modelTesla3 = upsertCarFeature(model.get(), "MODEL_3");

        ensureCarsExist(13);
        attachFeaturesToCars(
                // Ofc, bmw is under repair
                List.of(fuelGas.get(), brandBmw, modelSeries3, colorBlack, statusUnderRepair.get()),
                List.of(fuelDiesel.get(), brandAudi, modelA4, colorWhite, statusInactive.get()),
                List.of(fuelElectric.get(), brandToyota, modelCorolla, colorWhite, statusActive.get()),
                List.of(fuelDiesel.get(), brandMercedes, modelCClass, colorSilver, statusActive.get()),
                List.of(fuelGas.get(), brandVolkswagen, modelGolf, colorBlue, statusActive.get()),
                List.of(fuelDiesel.get(), brandSkoda, modelOctavia, colorGrey, statusInactive.get()),
                List.of(fuelGas.get(), brandFord, modelFocus, colorBrown, statusActive.get()),
                List.of(fuelDiesel.get(), brandRenault, modelClio, colorBeige, statusUnderRepair.get()),
                List.of(fuelGas.get(), brandHyundai, modelI30, colorBronze, statusActive.get()),
                List.of(fuelGas.get(), brandMazda, modelMazda3, colorNavy, statusInactive.get()),
                List.of(fuelDiesel.get(), brandNissan, modelQashqai, colorWhite, statusActive.get()),
                List.of(fuelGas.get(), brandHonda, modelCivic, colorRed, statusUnderRepair.get()),
                List.of(fuelElectric.get(), brandTesla, modelTesla3, colorBlack, statusActive.get())
        );

        // Upserting bookings
        Location loc1 = locationRepository.findById(1).orElseThrow();
        Location loc2 = locationRepository.findById(2).orElseThrow();
        Location loc3 = locationRepository.findById(3).orElseThrow();

        Car car1 = carRepository.findById(1).orElseThrow();
        Car car2 = carRepository.findById(2).orElseThrow();
        Car car3 = carRepository.findById(3).orElseThrow();
        Car car4 = carRepository.findById(4).orElseThrow();
        Car car5 = carRepository.findById(5).orElseThrow();
        Car car6 = carRepository.findById(6).orElseThrow();
        Car car7 = carRepository.findById(7).orElseThrow();

        seedCarImages();

        var todayStart = LocalDate.now().atStartOfDay();
        var created = bookingStatusDictionaryRepository.findById((short)BookingStatus.CREATED.getCode());
        var cancelled = bookingStatusDictionaryRepository.findById((short)BookingStatus.CANCELLED.getCode());
        var completed = bookingStatusDictionaryRepository.findById((short)BookingStatus.COMPLETED.getCode());
        if(created.isEmpty() || completed.isEmpty() || cancelled.isEmpty())
            throw new IllegalStateException("Upsert statuses first");
        bookingRepository.save(makeBooking(u1, car1, created.get(), null, loc1, loc2, todayStart.plusDays(1), todayStart.plusDays(4)));
        bookingRepository.save(makeBooking(u2, car2, cancelled.get(), null, loc2, loc2, todayStart.plusDays(2), todayStart.plusDays(3)));
        bookingRepository.save(makeBooking(u3, car3, completed.get(), null, loc1, loc2, todayStart.minusDays(5), todayStart.minusDays(2)));
        bookingRepository.save(makeBooking(u4, car4, created.get(), null, loc2, loc1, todayStart.plusDays(5), todayStart.plusDays(7)));
        bookingRepository.save(makeBooking(u5, car5, created.get(), null, loc1, loc1, todayStart.plusDays(8), todayStart.plusDays(10)));
        bookingRepository.save(makeBooking(u6, car6, cancelled.get(), null, loc2, loc1, todayStart.plusDays(1), todayStart.plusDays(2)));
        bookingRepository.save(makeBooking(u7, car7, created.get(), null, loc1, loc2, todayStart.plusDays(3), todayStart.plusDays(6)));
    }

    @Transactional
    public void seedCarImages() {
        uploadFromPath(1, "seed/car-images/car-1/1.jpg");
        uploadFromPath(1, "seed/car-images/car-1/2.jpg");
        uploadFromPath(1, "seed/car-images/car-1/3.jpg");
        uploadFromPath(2, "seed/car-images/car-2/1.jpg");
        uploadFromPath(2, "seed/car-images/car-2/2.jpg");
        uploadFromPath(2, "seed/car-images/car-2/3.jpg");
        uploadFromPath(2, "seed/car-images/car-2/4.jpg");
        uploadFromPath(3, "seed/car-images/car-3/1.avif");
        uploadFromPath(3, "seed/car-images/car-3/2.avif");
        uploadFromPath(3, "seed/car-images/car-3/3.avif");
    }

    private void uploadFromPath(Integer carId, String path) {
        try {
            var res = new ClassPathResource(path);
            byte[] bytes = res.getInputStream().readAllBytes();

            String filename = res.getFilename() == null ? "image.jpg" : res.getFilename();
            String contentType = MediaTypeFactory
                    .getMediaType(filename)
                    .map(MediaType::toString)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE);

            MockMultipartFile mf = new MockMultipartFile(
                    "file",
                    filename,
                    contentType,
                    bytes
            );

            carImageService.upload(mf, carId); // call your service method
        } catch (IOException e) {
            throw new IllegalStateException("Failed to seed upload: " + path, e);
        }
    }

    private Booking makeBooking(User user, Car car,
                                BookingStatusDictionary carBookingStatus,
                                BookingStatusDictionary flatBookingStatus,
                                Location pickupLocation,
                                Location returnLocation,
                                LocalDateTime from,
                                LocalDateTime to) {
        Booking b = new Booking();
        b.setUser(user);
        b.setCar(car);
        // allowed optional
        b.setFlatBookingStatus(flatBookingStatus);
        b.setPickupLocation(pickupLocation);
        b.setReturnLocation(returnLocation);
        b.setCarBookingStatus(carBookingStatus);
        b.setCarBookingDateFrom(from);
        b.setCarBookingDateTo(to);
        b.setEnabled(true);
        return b;
    }

    private UserTypeDictionary upsertUserType(String name,String description) {
        var existing = userTypeDictionaryRepository.findByName(name);
        if(existing.isPresent()) return existing.get();
        var e = new UserTypeDictionary();

        e.setName(name);
        e.setDescription(description);
        e.setEnabled(true);
        return userTypeDictionaryRepository.save(e);
    }

    private User upsertUserByEmail(String email, String firstName,
                                   String lastName, UserTypeDictionary userType,
                                   String password, Long contactNumber)
    {

        var existing = userRepository.findByEmail(email);
        if(existing.isPresent()) return existing.get();
        var user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUserType(userType);
        // optional fields
        user.setPassword(password);
        user.setContactNumber(contactNumber);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    private Location upsertLocation(String locationName, BigDecimal latitude, BigDecimal longitude) {
        var existing = locationRepository.findByLocationName(locationName);
        if(existing.isPresent()) return existing.get();

        var e = new Location();
        e.setLocationName(locationName);
        e.setLatitude(latitude);
        e.setLongitude(longitude);
        e.setEnabled(true);
        return locationRepository.save(e);
    }

    private BookingStatusDictionary upsertBookingStatus(String name, String description) {
        var existing = bookingStatusDictionaryRepository.findByName(name);
        if(existing.isPresent()) return existing.get();

        var statusDictionary = new BookingStatusDictionary();
        statusDictionary.setName(name);
        statusDictionary.setDescription(description);
        statusDictionary.setEnabled(true);
        return bookingStatusDictionaryRepository.save(statusDictionary);
    }

    private void ensureCarsExist(int targetCount) {
        long current = carRepository.count();
        if (current >= targetCount) return;
        int toCreate = (int) (targetCount - current);
        for (int i = 0; i < toCreate; i++) {
            Car c = new Car();
            double randomPrice = ThreadLocalRandom.current().nextDouble(100.0, 500.0);
            var price = BigDecimal.valueOf(randomPrice).setScale(2, RoundingMode.HALF_UP);
            c.setPrice(price);
            c.setEnabled(true);
            carRepository.save(c);
        }
    }

    private CarFeatureDictionary upsertCarFeatureDictionary(String name) {
        var existing = carFeatureDictionaryRepository.findByName(name);
        if(existing.isPresent()) return existing.get();

        var featureType = new CarFeatureDictionary();
        featureType.setName(name);
        featureType.setEnabled(true);
        return carFeatureDictionaryRepository.save(featureType);
    }

    private CarFeature upsertCarFeature(CarFeatureDictionary dict, String value) {
        return carFeatureRepository.findFeatureBy(dict.getCarFeatureDictionaryId(), value)
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