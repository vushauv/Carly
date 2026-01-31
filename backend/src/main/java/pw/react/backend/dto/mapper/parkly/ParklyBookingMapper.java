package pw.react.backend.dto.mapper.parkly;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.dto.mapper.booking.LocationMapper;
import pw.react.backend.dto.response.parkly.ParklyGetBookingResponseDto;
import pw.react.backend.dto.response.parkly.ParklyGetCarResponseDto;
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

    // Helper methods:
    @Named("toDisplayName")
    default String toDisplayName(String name) {
        if (name == null) return null;
        return DisplayNameConverter.toDisplayName(name);
    }
}
