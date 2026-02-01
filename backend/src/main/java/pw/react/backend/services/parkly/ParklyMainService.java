package pw.react.backend.services.parkly;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.domain.enums.SystemUsers;
import pw.react.backend.exceptions.ResourceNotFoundException;
import pw.react.backend.repositories.LocationRepository;
import pw.react.backend.repositories.booking.BookingRepository;
import pw.react.backend.repositories.booking.BookingStatusDictionaryRepository;
import pw.react.backend.repositories.user.UserRepository;
import pw.react.backend.services.booking.BookingService;
import pw.react.backend.services.car.CarMainService;
import pw.react.backend.services.user.UserService;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class ParklyMainService implements ParklyService {
    //TODO (WSE): We have to know the ID assigned to Parkly here, I think realistically the ids wont change so keeping the email
    // is equivalent to keeping the hard-coded ID iteself, maybe there is a better way in the future

    // TODO: CAN PARKLY SERVICE USE BookingService for all that functionality??

    // TODO: better to use ID here, email could be changed by them
    private static final Integer PARKLY_SYSTEM_ID = SystemUsers.PARKLY.getCode();
    private static final String CANCELLED_STATUS = BookingStatus.CANCELLED.name();

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final BookingRepository bookingRepository;
    private final BookingStatusDictionaryRepository bookingStatusDictionaryRepository;

    private final CarMainService carService;
    private final UserService userService;

    @Transactional
    public void cancelCarBooking(Integer bookingId)
            throws AccessDeniedException
    {
        var booking = checkCarBooking(bookingId);
        bookingService.cancelCarBooking(booking.getBookingId());
    }

    @Override
    @Transactional(readOnly = true)
    public Booking getBookingById(Integer bookingId)
            throws ResourceNotFoundException, AccessDeniedException
    {
        // We assume that the parkly system is registered
        return checkCarBooking(bookingId);
    }

    @Override
    @Transactional
    public Booking createCarBooking(Booking booking)
        throws BadRequestException
    {
        var user = userService.getUserByID(PARKLY_SYSTEM_ID);
        booking.setUser(user);
        return bookingService.batchSave(List.of(booking)).getFirst();
    }

    private Booking checkCarBooking(Integer bookingId)
            throws ResourceNotFoundException, AccessDeniedException
    {
        var parklySystem = userService.getUserByID(PARKLY_SYSTEM_ID);

        var booking =  bookingService.getById(bookingId);
        if(booking.isEmpty())
            throw new ResourceNotFoundException("Booking with id " + bookingId + " not found");

        var resolvedBooking = booking.get();
        if(!Objects.equals(resolvedBooking.getUser().getUserId(), parklySystem.getUserId()))
            throw new AccessDeniedException("Access denied to booking with id " + bookingId);
        return resolvedBooking;
    }
}

