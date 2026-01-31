package pw.react.backend.dto.mapper.parkly;

import org.mapstruct.*;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.booking.Location;
import pw.react.backend.domain.car.Car;
import pw.react.backend.dto.mapper.booking.LocationMapper;
import pw.react.backend.dto.request.parkly.ParklyCreateBookingRequestDto;
import pw.react.backend.dto.response.parkly.ParklyCreateBookingResponseDto;
import pw.react.backend.dto.response.parkly.ParklyGetBookingResponseDto;
import pw.react.backend.utils.converters.response.DisplayNameConverter;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = LocationMapper.class)
public interface ParklyBookingMapper {
    // OUT mapping:
    @Mapping(target = "bookingId", source = "bookingId")
    @Mapping(target = "carId", source = "car.carId")
    @Mapping(target = "pickupLocation", source = "pickupLocation")
    @Mapping(target = "returnLocation", source = "returnLocation")
    @Mapping(target = "status.name", source = "carBookingStatus.name", qualifiedByName = "toDisplayName")
    @Mapping(target = "status.id", source = "carBookingStatus.bookingStatusDictionaryId")
    @Mapping(target = "dateFrom", source = "carBookingDateFrom")
    @Mapping(target = "dateTo", source = "carBookingDateTo")
    ParklyGetBookingResponseDto toGetCarResponseDto(Booking booking);

    @Mapping(target = "status.name", source = "carBookingStatus.name", qualifiedByName = "toDisplayName")
    @Mapping(target = "status.id", source = "carBookingStatus.bookingStatusDictionaryId")
    ParklyCreateBookingResponseDto toCreateBookingResponseDto(Booking booking);

    // IN mappings:
    @Mapping(target = "bookingId", ignore = true)
    @Mapping(target = "car", source = "carId", qualifiedByName = "carFromId")
    @Mapping(target = "pickupLocation", source = "pickupLocationId", qualifiedByName = "locationFromId")
    @Mapping(target = "returnLocation", source = "returnLocationId", qualifiedByName = "locationFromId")
    Booking fromCreateBookingRequestDto(ParklyCreateBookingRequestDto dto);


    // Helper methods:
    @Named("toDisplayName")
    default String toDisplayName(String name) {
        if (name == null) return null;
        return DisplayNameConverter.toDisplayName(name);
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
}
