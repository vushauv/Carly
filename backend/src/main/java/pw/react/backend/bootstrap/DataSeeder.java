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
import pw.react.backend.domain.user.UserTypeDictionary;
import pw.react.backend.repositories.LocationRepository;
import pw.react.backend.repositories.car.CarRepository;
import pw.react.backend.repositories.user.UserTypeDictionaryRepository;

import java.math.BigDecimal;

@Slf4j
@Component
@Profile({"mysql", "batch"})
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserTypeDictionaryRepository userTypeDictionaryRepository;
    private final CarRepository carRepository;
    private final LocationRepository locationRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("DataSeeder running. Active profiles: {}", String.join(",", args.getSourceArgs()));


        // 1) User types
        upsertUserType("CUSTOMER", "Customer", "Standard end user");
        upsertUserType("SYSTEM", "System", "System / integration user");
        upsertUserType("SUPER_ADMIN", "Super Admin", "All permissions");
        upsertUserType("ADMIN", "Admin", "Administrative user");

        // 2) Locations
        upsertLocation("Warsaw Central", new BigDecimal("52.2297"), new BigDecimal("21.0122"));
        upsertLocation("Krakow Main", new BigDecimal("50.0647"), new BigDecimal("19.9450"));
        upsertLocation("Gdansk Old Town", new BigDecimal("54.3520"), new BigDecimal("18.6466"));

        // 3) Cars (no natural key -> just ensure a few exist)
        ensureCarsExist(5);

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
}
