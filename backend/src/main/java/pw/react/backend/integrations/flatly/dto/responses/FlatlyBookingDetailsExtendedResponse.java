package pw.react.backend.integrations.flatly.dto.responses;

import lombok.Getter;
import lombok.Setter;
import pw.react.backend.integrations.flatly.dto.FlatlyBookingDto;
import pw.react.backend.integrations.flatly.dto.FlatlyFlatDetailsDto;
import pw.react.backend.integrations.flatly.dto.FlatlyFlatImageDto;

import java.util.List;

@Getter
@Setter
public class FlatlyBookingDetailsExtendedResponse {
    private FlatlyBookingDto booking;
    private FlatlyFlatDetailsDto flat;
    private List<FlatlyFlatImageDto> flatImages;

    // extra fields
    private Integer userId;
    private String flatBookingStatus;
}
