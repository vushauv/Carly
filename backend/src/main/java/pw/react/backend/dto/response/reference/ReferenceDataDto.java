package pw.react.backend.dto.response.reference;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import pw.react.backend.dto.models.BookingStatusDto;
import pw.react.backend.dto.models.LocationDto;
import pw.react.backend.dto.models.LookupDictionaryDto;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReferenceDataDto {
    private List<LocationDto> returnLocations;
    private List<LocationDto> pickupLocations;
    private List<BookingStatusDto> bookingStatuses;
    List<LookupDictionaryDto> referenceData = new ArrayList<>();
}
