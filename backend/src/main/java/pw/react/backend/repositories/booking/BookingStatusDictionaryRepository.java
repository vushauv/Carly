package pw.react.backend.repositories.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import pw.react.backend.domain.booking.BookingStatusDictionary;

import java.util.Optional;

public interface BookingStatusDictionaryRepository extends JpaRepository<BookingStatusDictionary, Short> {
    Optional<BookingStatusDictionary> findByName(String name);
}
