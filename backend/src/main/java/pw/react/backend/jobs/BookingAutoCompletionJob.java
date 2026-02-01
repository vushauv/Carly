package pw.react.backend.jobs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.repositories.booking.BookingRepository;
import pw.react.backend.repositories.booking.BookingStatusDictionaryRepository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingAutoCompletionJob {

    private final BookingRepository bookingRepository;
    private final BookingStatusDictionaryRepository statusRepository;

    // Runs daily at midnight Warsaw time
    @Scheduled(cron = "0 0 0 * * *", zone = "Europe/Warsaw")
    @Transactional
    public void completeOverdueBookings() {
        var completed = statusRepository.findByName(BookingStatus.COMPLETED.name())
                .orElseThrow(() -> new IllegalStateException(BookingStatus.COMPLETED.name() + " status not found. Seed data missing."));
        var cancelled = statusRepository.findByName(BookingStatus.CANCELLED.name())
                .orElseThrow(() -> new IllegalStateException(BookingStatus.CANCELLED.name() + " status not found. Seed data missing."));

        short completedId = completed.getBookingStatusDictionaryId();
        short cancelledId = cancelled.getBookingStatusDictionaryId();

        int affected = bookingRepository.bulkCompleteOverdue(
                completedId,
                Timestamp.from(Instant.now()),
                List.of(completedId, cancelledId)
        );

        if (affected > 0) {
            log.info("Auto-completed {} overdue bookings", affected);
        }
    }
}
