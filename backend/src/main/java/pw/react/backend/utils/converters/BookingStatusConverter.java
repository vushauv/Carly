package pw.react.backend.utils.converters;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;
import pw.react.backend.domain.booking.Booking;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.domain.enums.CarAvailabilityStatus;

import java.util.Arrays;
import java.util.stream.Collectors;

@Component
public class BookingStatusConverter
        implements Converter<String, BookingStatus> {
    @Override
    public BookingStatus convert(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        var normalised = value.trim().toUpperCase();

        try {
            return BookingStatus.valueOf(normalised);
        } catch (IllegalArgumentException ex) {
            String allowed = Arrays.stream(BookingStatus.values())
                    .map(Enum::name).collect(Collectors.joining(","));

            throw new IllegalArgumentException(
                    String.format("Invalid availability status '%s'. Allowed values: %s", value, allowed),
                    ex
            );
        }
    }
}
