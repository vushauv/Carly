package pw.react.backend.dto.response.booking;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PagedBookingsResponse {
    private List<GetBookingResponse> items;
    private Integer page;
    private Integer size;
    private Long total;
}
