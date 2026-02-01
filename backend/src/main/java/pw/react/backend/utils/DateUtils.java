package pw.react.backend.utils;

import org.apache.coyote.BadRequestException;
import pw.react.backend.dto.models.DateRange;

import java.time.LocalDate;
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

    private static DateRange normaliseDates(DateRange dateRange)
            throws BadRequestException
    {
        if (!dateRange.getTo().isAfter(dateRange.getFrom()))
            throw new BadRequestException("'to' must be after 'from'");
        return dateRange;
    }

    // All bookings are made for whole days
    private static DateRange normaliseToWholeDays(DateRange dateRange)
    {
        LocalDate fromDate = dateRange.getFrom().toLocalDate();
        LocalDate toDate   = dateRange.getTo().toLocalDate();

        LocalDateTime from = fromDate.atStartOfDay(); // 00:00

        LocalDateTime to = dateRange.getTo().toLocalTime()
                .equals(java.time.LocalTime.MIDNIGHT)
                ? dateRange.getTo()
                : toDate.plusDays(1).atStartOfDay();
        // normalize end only if needed
        // next day 00:00 (exclusive)

        return new DateRange(from, to);
    }

    public static DateRange validateAndNormalise(DateRange dateRange) throws BadRequestException {
        if (dateRange == null || dateRange.getFrom() == null || dateRange.getTo() == null) {
            throw new BadRequestException("dateRange (from/to) is required");
        }
        // validates logical order
        normaliseDates(dateRange);

        LocalDate fromDate = dateRange.getFrom().toLocalDate();
        LocalDate toDate   = dateRange.getTo().toLocalDate();

        LocalDate today = LocalDate.now();
        if (fromDate.isBefore(today)) {
            throw new BadRequestException("dateFrom cannot be before today");
        }
        return DateUtils.normaliseToWholeDays(dateRange);
    }
}
