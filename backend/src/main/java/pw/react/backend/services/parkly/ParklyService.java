package pw.react.backend.services.parkly;

import pw.react.backend.dto.parkly.*;

import java.util.List;

public interface ParklyService {
    ParklyBookingResponse createCarBooking(ParklyCreateCarBookingRequest request);
    boolean cancelCarBooking(Integer externalBookingId);
    ParklyBookingDetailsResponse getCarBookingByExternalBookingId(Integer externalBookingId);
}

