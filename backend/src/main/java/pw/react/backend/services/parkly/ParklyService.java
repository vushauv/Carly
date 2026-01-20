package pw.react.backend.services.parkly;

import pw.react.backend.dto.parkly.ParklyCreateCarBookingRequest;
import pw.react.backend.dto.parkly.ParklySearchCarsRequest;
import pw.react.backend.dto.parkly.ParklyBookingResponse;
import pw.react.backend.dto.parkly.ParklyCarResponse;

import java.util.List;

public interface ParklyService {

    List<ParklyCarResponse> searchAvailableCars(ParklySearchCarsRequest request);

    ParklyBookingResponse createCarBooking(ParklyCreateCarBookingRequest request);
    boolean cancelCarBooking(Long externalBookingId);
}

