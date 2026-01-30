package pw.react.backend.services.parkly;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.Location;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.domain.user.User;
import pw.react.backend.dto.mapper.parkly.ParklyBookingMapper;
import pw.react.backend.dto.mapper.parkly.ParklyCarMapper;
import pw.react.backend.dto.parkly.*;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.LocationRepository;
import pw.react.backend.repositories.booking.BookingRepository;
import pw.react.backend.repositories.booking.BookingStatusDictionaryRepository;
import pw.react.backend.repositories.user.UserRepository;
import pw.react.backend.services.car.CarMainService;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ParklyMainService implements ParklyService {

    //TODO (WSE): We have to know the ID assigned to Parkly here, I think realistically the ids wont change so keeping the email
    // is equivalent to keeping the hard-coded ID iteself, maybe there is a better way in the future

    // TODO: CAN PARKLY SERVICE USE BookingService for all that functionality??
    //private static final Integer PARKLY_SYSTEM_ID = 2;

    // TODO: better to use ID here, email could be changed by them
    private static final String PARKLY_SYSTEM_EMAIL = "parkly@pw.edu.pl";
    private static final String CREATED_STATUS = BookingStatus.CREATED.name();
    private static final String CANCELLED_STATUS = BookingStatus.CANCELLED.name();

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final BookingRepository bookingRepository;
    private final BookingStatusDictionaryRepository bookingStatusDictionaryRepository;

    private final ParklyCarMapper parklyCarMapper;
    private final ParklyBookingMapper parklyBookingMapper;

    private final CarMainService carService;

    @Override
    @Transactional
    public ParklyBookingResponse createCarBooking(ParklyCreateCarBookingRequest request) {
        //TODO: remove locations if we decide on getting rid of them
        User parklyUser = userRepository.findByEmail(PARKLY_SYSTEM_EMAIL)
                .orElseThrow(() -> new ResourceNotFoundException("Parkly system user not found. Seed data missing."));

        BookingStatusDictionary created = bookingStatusDictionaryRepository.findByName(CREATED_STATUS)
                .orElseThrow(() -> new ResourceNotFoundException(CREATED_STATUS + " status not found. Seed data missing."));

        // Idempotency: if Parkly retries same externalBookingId, return existing booking
        return bookingRepository
                .findByUser_UserIdAndProviderExternalBookingId(parklyUser.getUserId(), request.getExternalBookingId())
                .map(existing -> toResponse(existing, existing.getCarBookingStatus()))
                .orElseGet(() -> {

                    // Use CarService (not repository)
                    Car car = carService.getById(request.getCarId());

                    Booking booking = new Booking();
                    booking.setEnabled(true);
                    booking.setUser(parklyUser);
                    booking.setCar(car);

                    if (request.getPickupLocationId() != null) {
                        Location pickup = locationRepository.findById(request.getPickupLocationId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Pickup location not found: " + request.getPickupLocationId()
                                ));
                        booking.setPickupLocation(pickup);
                    }

                    if (request.getReturnLocationId() != null) {
                        Location ret = locationRepository.findById(request.getReturnLocationId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Return location not found: " + request.getReturnLocationId()
                                ));
                        booking.setReturnLocation(ret);
                    }

                    booking.setProviderExternalBookingId(request.getExternalBookingId());
                    booking.setCarBookingStatus(created);
                    booking.setCarBookingDateFrom(request.getDateFrom());
                    booking.setCarBookingDateTo(request.getDateTo());

                    Booking saved = bookingRepository.save(booking);
                    log.info("Parkly booking created: bookingId={}, externalBookingId={}",
                            saved.getBookingId(), request.getExternalBookingId());

                    return toResponse(saved, created);
                });
    }
    @Transactional
    public boolean cancelCarBooking(Integer externalBookingId) {
        User parklyUser = userRepository.findByEmail("parkly@pw.edu.pl")
                .orElseThrow(() -> new ResourceNotFoundException("Parkly system user not found. Seed data missing."));

        BookingStatusDictionary cancelled = bookingStatusDictionaryRepository.findByName(CANCELLED_STATUS)
                .orElseThrow(() -> new ResourceNotFoundException(CANCELLED_STATUS + "status missing (seed data)"));

        return bookingRepository
                .findByUser_UserIdAndProviderExternalBookingId(parklyUser.getUserId(), externalBookingId)
                .map(b -> {
                    // safeguard to no cancel an already cancelled booking
                    if (b.getCarBookingStatus() != null &&
                            CANCELLED_STATUS.equalsIgnoreCase(b.getCarBookingStatus().getName())) {
                        return true;
                    }

                    b.setCarBookingStatus(cancelled);
                    bookingRepository.save(b);
                    return true;
                })
                .orElse(false);
    }
    @Override
    @Transactional(readOnly = true)
    public ParklyBookingDetailsResponse getCarBookingByExternalBookingId(Integer externalBookingId) {

        User parklyUser = userRepository.findByEmail(PARKLY_SYSTEM_EMAIL)
                .orElseThrow(() -> new ResourceNotFoundException("Parkly system user not found. Seed data missing."));

        Booking booking = bookingRepository
                .findByUser_UserIdAndProviderExternalBookingId(parklyUser.getUserId(), externalBookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parkly booking not found for externalBookingId: " + externalBookingId
                ));

        Car carWithFeatures = null;
        if (booking.getCar() != null) {
            carWithFeatures = carService.getById(booking.getCar().getCarId());
        }

        Map<Integer, List<Integer>> imageUrlsByCarId = null;
        if(carWithFeatures != null) {
            imageUrlsByCarId = carService.linkCarImages(List.of(carWithFeatures));
        }
        return parklyBookingMapper.toDetails(booking, carWithFeatures, imageUrlsByCarId);
    }

    private ParklyBookingResponse toResponse(Booking booking, BookingStatusDictionary status) {
        ParklyBookingResponse r = new ParklyBookingResponse();
        r.setBookingId(booking.getBookingId());
        r.setStatus(status == null ? null : status.getName());
        return r;
    }
}

