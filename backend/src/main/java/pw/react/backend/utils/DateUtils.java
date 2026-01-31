package pw.react.backend.utils;

import org.apache.coyote.BadRequestException;
import pw.react.backend.dto.models.DateRange;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class DateUtils {
    public static long calculateDayDifference(LocalDateTime from, LocalDateTime to)
    {
        return ChronoUnit.DAYS.between(
                from,
                to
        );
    }

    public static LocalDateTime parseLocalDateTime(String time)
    {
        return (time == null || time.isBlank())
                ? null
                : LocalDateTime.parse(time);
    }

    public static DateRange normaliseDates(DateRange dateRange)
            throws BadRequestException
    {
        if (!dateRange.getTo().isAfter(dateRange.getFrom()))
            throw new BadRequestException("'to' must be after 'from'");
        return dateRange;
    }
}
