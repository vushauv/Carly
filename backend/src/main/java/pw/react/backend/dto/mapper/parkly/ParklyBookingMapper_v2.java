package pw.react.backend.dto.mapper.parkly;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.car.Car;
import pw.react.backend.dto.response.parkly.ParklyGetBookingResponseDto;
import pw.react.backend.dto.response.parkly.ParklyGetCarResponseDto;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ParklyBookingMapper_v2 {
    private final ParklyCarMapper parklyCarMapper;

    // TODO: MODIFIED - test whether works
    public ParklyGetBookingResponseDto toDetails(Booking booking,
                                                 Car carWithFeatures,
                                                 Map<Integer, List<Integer>> imageUrlsByCarId) {

        ParklyGetBookingResponseDto r = new ParklyGetBookingResponseDto();
//        r.setBookingId(booking.getBookingId());
//        r.setExternalBookingId(booking.getProviderExternalBookingId());
//        r.setStatus(booking.getCarBookingStatus() == null ? null : booking.getCarBookingStatus().getName());
//        r.setDateFrom(booking.getCarBookingDateFrom());
//        r.setDateTo(booking.getCarBookingDateTo());
//
//        if (carWithFeatures != null) {
//            r.setCar(parklyCarMapper.toGetResponseDto(carWithFeatures,
//                    carWithFeatures.getCarId(),
//                    imageUrlsByCarId.get(carWithFeatures.getCarId())));
//        }

        return r;
    }

    public ParklyGetCarResponseDto toGetCarResponseDto(Booking booking)
    {
        var dto = new ParklyGetCarResponseDto();
        //dto.setBookingId(booking.getBookingId());
        //dto.setStatus();
        return  dto;
    }
}

