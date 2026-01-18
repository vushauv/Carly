package pw.react.backend.dto.mapper;

import org.mapstruct.*;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.Location;
import pw.react.backend.domain.user.User;
import pw.react.backend.dto.request.booking.CreateBookingRequest;
import pw.react.backend.dto.request.booking.UpdateBookingRequest;
import pw.react.backend.dto.response.booking.BookingResponse;
import pw.react.backend.dto.response.booking.GetBookingResponse;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingMapper {

    // -------------------------
    // CREATE
    // -------------------------
    @Mappings({
            @Mapping(target = "bookingId", ignore = true),

            @Mapping(target = "user", source = "userId", qualifiedByName = "userFromId"),
            @Mapping(target = "car", source = "carId", qualifiedByName = "carFromId"),
            @Mapping(target = "pickupLocation", source = "pickupLocationId", qualifiedByName = "locationFromId"),
            @Mapping(target = "returnLocation", source = "returnLocationId", qualifiedByName = "locationFromId"),
            @Mapping(target = "carBookingStatus", source = "carBookingStatusId", qualifiedByName = "statusFromId"),
            @Mapping(target = "flatBookingStatus", source = "flatBookingStatusId", qualifiedByName = "statusFromId")
    })
    Booking createRequestToBooking(CreateBookingRequest createBookingRequest);

    List<Booking> createRequestToBookingList(List<CreateBookingRequest> createBookingRequests);

    // -------------------------
    // UPDATE
    // -------------------------
    @Mappings({
            @Mapping(target = "bookingId", ignore = true),
            @Mapping(target = "user", ignore = true), // user typically not updated via booking update
            @Mapping(target = "car", source = "carId", qualifiedByName = "carFromId"),
            @Mapping(target = "pickupLocation", source = "pickupLocationId", qualifiedByName = "locationFromId"),
            @Mapping(target = "returnLocation", source = "returnLocationId", qualifiedByName = "locationFromId"),
            @Mapping(target = "carBookingStatus", source = "carBookingStatusId", qualifiedByName = "statusFromId"),
            @Mapping(target = "flatBookingStatus", source = "flatBookingStatusId", qualifiedByName = "statusFromId")
    })
    Booking updateRequestToBooking(UpdateBookingRequest updateBookingRequest);


    /**
     * Apply patch-like update: only overwrite fields that are non-null in the request.
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mappings({
            @Mapping(target = "car", source = "carId", qualifiedByName = "carFromId"),
            @Mapping(target = "pickupLocation", source = "pickupLocationId", qualifiedByName = "locationFromId"),
            @Mapping(target = "returnLocation", source = "returnLocationId", qualifiedByName = "locationFromId"),
            @Mapping(target = "carBookingStatus", source = "carBookingStatusId", qualifiedByName = "statusFromId"),
            @Mapping(target = "flatBookingStatus", source = "flatBookingStatusId", qualifiedByName = "statusFromId")
            // providerExternalBookingId, dates will map automatically by name
    })
    void applyUpdate(UpdateBookingRequest request, @MappingTarget Booking booking);


    // -------------------------
    // RESPONSES
    // -------------------------
    @Mapping(target = "id", source = "bookingId")
    BookingResponse bookingToResponse(Booking booking);

    List<BookingResponse> bookingToResponseList(List<Booking> bookings);

    @Mappings({
            @Mapping(target = "id", source = "bookingId"),
            @Mapping(target = "userId", source = "user.userId"),
            @Mapping(target = "carId", source = "car.carId"),
            @Mapping(target = "pickupLocationId", source = "pickupLocation.locationId"),
            @Mapping(target = "returnLocationId", source = "returnLocation.locationId"),
            @Mapping(target = "carBookingStatusId", source = "carBookingStatus.bookingStatusDictionaryId"),
            @Mapping(target = "flatBookingStatusId", source = "flatBookingStatus.bookingStatusDictionaryId")
    })
    GetBookingResponse bookingToGetBookingResponse(Booking booking);

    List<GetBookingResponse> bookingToGetBookingResponseList(List<Booking> bookings);

    // -------------------------
    // ID -> entity stub mappers
    // -------------------------
    @Named("userFromId")
    default User userFromId(Integer id) {
        if (id == null) return null;
        User u = new User();
        u.setUserId(id);
        return u;
    }

    @Named("carFromId")
    default Car carFromId(Integer id) {
        if (id == null) return null;
        Car c = new Car();
        c.setCarId(id);
        return c;
    }

    @Named("locationFromId")
    default Location locationFromId(Integer id) {
        if (id == null) return null;
        Location l = new Location();
        l.setLocationId(id);
        return l;
    }

    @Named("statusFromId")
    default BookingStatusDictionary statusFromId(Short id) {
        if (id == null) return null;
        BookingStatusDictionary s = new BookingStatusDictionary();
        s.setBookingStatusDictionaryId(id);
        return s;
    }
}
