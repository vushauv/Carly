package pw.react.backend.dto.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.car.Car;
import pw.react.backend.dto.parkly.ParklyBookingDetailsResponse;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ParklyBookingMapper {
    private final ParklyCarMapper parklyCarMapper;

    // TODO: MODIFIED - test whether works
    public ParklyBookingDetailsResponse toDetails(Booking booking,
                                                  Car carWithFeatures,
                                                  Map<Integer, List<Integer>> imageUrlsByCarId) {

        ParklyBookingDetailsResponse r = new ParklyBookingDetailsResponse();
        r.setBookingId(booking.getBookingId());
        r.setExternalBookingId(booking.getProviderExternalBookingId());
        r.setStatus(booking.getCarBookingStatus() == null ? null : booking.getCarBookingStatus().getName());
        r.setDateFrom(booking.getCarBookingDateFrom());
        r.setDateTo(booking.getCarBookingDateTo());

        if (carWithFeatures != null) {
            r.setCar(parklyCarMapper.toGetResponseDto(carWithFeatures,
                    carWithFeatures.getCarId(),
                    imageUrlsByCarId.get(carWithFeatures.getCarId())));
        }

        return r;
    }
}

