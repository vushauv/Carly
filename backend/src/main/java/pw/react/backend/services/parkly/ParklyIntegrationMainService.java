package pw.react.backend.services.parkly;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.Location;
import pw.react.backend.domain.user.User;
import pw.react.backend.dto.parkly.ParklyCreateCarBookingRequest;
import pw.react.backend.dto.parkly.ParklySearchCarsRequest;
import pw.react.backend.dto.parkly.ParklyBookingResponse;
import pw.react.backend.dto.parkly.ParklyCarResponse;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.LocationRepository;
import pw.react.backend.repositories.booking.BookingRepository;
import pw.react.backend.repositories.booking.BookingStatusDictionaryRepository;
import pw.react.backend.repositories.car.CarRepository;
import pw.react.backend.repositories.user.UserRepository;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ParklyIntegrationMainService implements ParklyIntegrationService {

    //TODO (WSE): We have to know the ID assigned to Parkly here, I think realistically the ids wont change so keeping the email
    // is equivalent to keeping the hard-coded ID iteself, maybe there is a better way in the future
    private static final Integer PARKLY_SYSTEM_ID = 2;
    private static final String PARKLY_SYSTEM_EMAIL = "parkly@pw.edu.pl";
    private static final String CREATED_STATUS = "CREATED";
    private static final String CANCELLED_STATUS = "CANCELLED";

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final LocationRepository locationRepository;
    private final BookingRepository bookingRepository;
    private final BookingStatusDictionaryRepository bookingStatusDictionaryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ParklyCarResponse> searchAvailableCars(ParklySearchCarsRequest request) {
        // Simple v1: return cars without true availability logic.
        // Later: exclude cars with overlapping bookings where status != CANCELLED and enabled=true.

        return carRepository.findAll(PageRequest.of(1, 10))
                .stream()
                .filter(Car::isEnabled)
                .map(c -> {
                    ParklyCarResponse r = new ParklyCarResponse();
                    r.setCarId(c.getCarId());
                    return r;
                })
                .toList();
    }

    @Override
    @Transactional
    public ParklyBookingResponse createCarBooking(ParklyCreateCarBookingRequest request) {
        User parklyUser = userRepository.findByEmail(PARKLY_SYSTEM_EMAIL)
                .orElseThrow(() -> new ResourceNotFoundException("Parkly system user not found. Seed data missing."));

        BookingStatusDictionary created = bookingStatusDictionaryRepository.findByName(CREATED_STATUS)
                .orElseThrow(() -> new ResourceNotFoundException("CREATED status not found. Seed data missing."));

        // Idempotency: if Parkly retries same externalBookingId, return existing booking
        return bookingRepository
                .findByUser_UserIdAndProviderExternalBookingId(parklyUser.getUserId(), request.getExternalBookingId())
                .map(existing -> toResponse(existing, existing.getCarBookingStatus()))
                .orElseGet(() -> {
                    // Validate car exists (minimal)
                    Car car = carRepository.findById(request.getCarId())
                            .orElseThrow(() -> new ResourceNotFoundException("Car not found: " + request.getCarId()));

                    Booking booking = new Booking();
                    booking.setEnabled(true);
                    booking.setUser(parklyUser);
                    booking.setCar(car);

                    if (request.getPickupLocationId() != null) {
                        Location pickup = locationRepository.findById(request.getPickupLocationId())
                                .orElseThrow(() -> new ResourceNotFoundException("Pickup location not found: " + request.getPickupLocationId()));
                        booking.setPickupLocation(pickup);
                    }

                    if (request.getReturnLocationId() != null) {
                        Location ret = locationRepository.findById(request.getReturnLocationId())
                                .orElseThrow(() -> new ResourceNotFoundException("Return location not found: " + request.getReturnLocationId()));
                        booking.setReturnLocation(ret);
                    }

                    booking.setProviderExternalBookingId(request.getExternalBookingId());
                    booking.setCarBookingStatus(created);
                    booking.setCarBookingDateFrom(request.getDateFrom());
                    booking.setCarBookingDateTo(request.getDateTo());

                    Booking saved = bookingRepository.save(booking);
                    log.info("Parkly booking created: bookingId={}, externalBookingId={}", saved.getBookingId(), request.getExternalBookingId());

                    return toResponse(saved, created);
                });
    }
    @Override
    @Transactional
    public boolean cancelCarBooking(Long externalBookingId) {
        User parklyUser = userRepository.findByEmail(PARKLY_SYSTEM_EMAIL)
                .orElseThrow(() -> new ResourceNotFoundException("Parkly system user not found. Seed data missing."));

        BookingStatusDictionary cancelled = bookingStatusDictionaryRepository.findByName(CANCELLED_STATUS)
                .orElseThrow(() -> new ResourceNotFoundException("CANCELLED status not found. Seed data missing."));

        return bookingRepository
                .findByUser_UserIdAndProviderExternalBookingId(parklyUser.getUserId(), externalBookingId)
                .map(b -> {
                    // idempotent: if already cancelled, do nothing but return success
                    if (b.getCarBookingStatus() != null
                            && CANCELLED_STATUS.equalsIgnoreCase(b.getCarBookingStatus().getName())) {
                        return true;
                    }
                    //We don't remove or set IsEnabled=1, just set the CarBookingStatus to 'Cancelled'
                    b.setCarBookingStatus(cancelled);
                    bookingRepository.save(b);
                    return true;
                })
                .orElse(false);
    }

    private ParklyBookingResponse toResponse(Booking booking, BookingStatusDictionary status) {
        ParklyBookingResponse r = new ParklyBookingResponse();
        r.setBookingId(booking.getBookingId());
        r.setStatus(status == null ? null : status.getName());
        return r;
    }
}

