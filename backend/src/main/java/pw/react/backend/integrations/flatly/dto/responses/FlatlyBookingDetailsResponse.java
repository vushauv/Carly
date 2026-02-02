package pw.react.backend.integrations.flatly.dto.responses;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.integrations.flatly.dto.FlatlyBookingDto;
import pw.react.backend.integrations.flatly.dto.FlatlyFlatDetailsDto;
import pw.react.backend.integrations.flatly.dto.FlatlyFlatImageDto;

import java.util.List;

@Getter
@Setter
public class FlatlyBookingDetailsResponse {
    private FlatlyBookingDto booking;
    private FlatlyFlatDetailsDto flat;
    private List<FlatlyFlatImageDto> flatImages;
}
