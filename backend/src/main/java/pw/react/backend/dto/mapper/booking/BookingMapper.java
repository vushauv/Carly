package pw.react.backend.dto.mapper.booking;

import org.mapstruct.*;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.domain.car.Car;
import pw.react.backend.domain.booking.Location;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.domain.user.User;
import pw.react.backend.dto.request.booking.CreateBookingRequestDto;
import pw.react.backend.dto.request.booking.UpdateBookingRequestDto;
import pw.react.backend.dto.response.booking.BookingResponse;
import pw.react.backend.dto.response.booking.GetBookingResponseDto;
import pw.react.backend.utils.converters.response.DisplayNameConverter;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = LocationMapper.class)
public interface BookingMapper {
    // IN mappings:

    // CREATE
    @Mappings({
            @Mapping(target = "bookingId", ignore = true),
            @Mapping(target = "user", source = "userId", qualifiedByName = "userFromId"),
            @Mapping(target = "car", source = "carId", qualifiedByName = "carFromId"),
            @Mapping(target = "pickupLocation", source = "pickupLocationId", qualifiedByName = "locationFromId"),
            @Mapping(target = "returnLocation", source = "returnLocationId", qualifiedByName = "locationFromId"),
    })
    Booking createRequestToBooking(CreateBookingRequestDto createBookingRequest);
    List<Booking> createRequestToBookingList(List<CreateBookingRequestDto> createBookingRequests);

    /**
     * Apply patch-like update: only overwrite fields that are non-null in the request.
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mappings({
            @Mapping(target = "pickupLocation", source = "pickupLocationId", qualifiedByName = "locationFromId"),
            @Mapping(target = "returnLocation", source = "returnLocationId", qualifiedByName = "locationFromId"),
            @Mapping(target = "carBookingStatus", source = "carBookingStatus", qualifiedByName = "statusFromEnum"),
            @Mapping(target = "flatBookingStatus", source = "flatBookingStatus", qualifiedByName = "statusFromEnum")
    })
    void applyUpdate(UpdateBookingRequestDto request, @MappingTarget Booking booking);

    // OUT:
    @Mapping(target = "id", source = "bookingId")
    @Mapping(target = "totalPrice", source = "booking", qualifiedByName = "calculateTotalPrice")
    BookingResponse bookingToResponse(Booking booking);

    List<BookingResponse> bookingToResponseList(List<Booking> bookings);

    @Mappings({
            @Mapping(target = "id", source = "bookingId"),
            @Mapping(target = "userId", source = "user.userId"),
            @Mapping(target = "carId", source = "car.carId"),
            @Mapping(target = "pickupLocation", source = "pickupLocation"),
            @Mapping(target = "returnLocation", source = "returnLocation"),
            @Mapping(target = "carStatus.name", source = "carBookingStatus.name", qualifiedByName = "toDisplayName"),
            @Mapping(target = "flatStatus.name", source = "flatBookingStatus.name", qualifiedByName = "toDisplayName"),
            @Mapping(target = "carStatus.id", source = "carBookingStatus.bookingStatusDictionaryId"),
            @Mapping(target = "flatStatus.id", source = "flatBookingStatus.bookingStatusDictionaryId"),
            @Mapping(target = "totalPrice", source = "booking", qualifiedByName = "calculateTotalPrice")
    })
    GetBookingResponseDto bookingToGetBookingResponse(Booking booking);

    List<GetBookingResponseDto> bookingToGetBookingResponseList(List<Booking> bookings);

    // Helper methods:
    @Named("toDisplayName")
    default String toDisplayName(String name) {
        if (name == null) return null;
        return DisplayNameConverter.toDisplayName(name);
    }

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

    @Named("statusFromEnum")
    default BookingStatusDictionary statusFromEnum(BookingStatus status) {
        if (status == null) return null;
        BookingStatusDictionary s = new BookingStatusDictionary();
        s.setBookingStatusDictionaryId((short) status.getCode());
        return s;
    }

    @Named("statusFromId")
    default BookingStatusDictionary statusFromId(Short id) {
        if (id == null) return null;
        BookingStatusDictionary s = new BookingStatusDictionary();
        s.setBookingStatusDictionaryId(id);
        return s;
    }

    @Named("calculateTotalPrice")
    default BigDecimal calculateTotalPrice(Booking booking) {
        BigDecimal carTotalPrice = booking.getCarTotalPrice();
        BigDecimal flatTotalPrice = booking.getFlatTotalPrice();

        if (flatTotalPrice == null) flatTotalPrice = BigDecimal.ZERO;
        return carTotalPrice.add(flatTotalPrice);
    }
}
