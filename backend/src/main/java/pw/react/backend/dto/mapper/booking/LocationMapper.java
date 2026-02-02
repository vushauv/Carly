package pw.react.backend.dto.mapper.booking;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.booking.Location;
import pw.react.backend.dto.models.LocationDto;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LocationMapper {
    // Location Mapping:
    @Mapping(target = "id", source = "locationId")
    @Mapping(target = "address", source = "locationName")
    LocationDto toLocationDto(Location location);

    List<LocationDto> toLocationDtoList(List<Location> location);
}
