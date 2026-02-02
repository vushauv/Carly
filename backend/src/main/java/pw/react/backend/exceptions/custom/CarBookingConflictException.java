package pw.react.backend.exceptions.custom;

import pw.react.backend.dto.models.DateRange;

public class CarBookingConflictException extends RuntimeException {
    public CarBookingConflictException (Integer carId, DateRange dateRange) {
        super("Car with id " + carId + " is already booked for the selected period from: "
                + dateRange.getFrom() + " to: " + dateRange.getTo());
    }
}
