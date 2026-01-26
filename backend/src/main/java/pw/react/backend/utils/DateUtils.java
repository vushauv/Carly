package pw.react.backend.utils;

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
}
