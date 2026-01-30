package pw.react.backend.dto.mapper.booking;

import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;
import pw.react.backend.domain.enums.BookingStatus;
import pw.react.backend.dto.request.booking.BookingSearchCriteria;

import java.time.LocalDateTime;

@Component
public class BookingCriteriaMapper {
    public BookingSearchCriteria toBookingSearchCriteria(Integer bookingId,
                                                         BookingStatus status,
                                                         LocalDateTime to,
                                                         LocalDateTime from,
                                                         Integer userId)
    {
        BookingSearchCriteria criteria = new BookingSearchCriteria();
        criteria.setBookingId(bookingId);
        criteria.setStatus(status);
        criteria.setDateTo(to);
        criteria.setDateFrom(from);
        criteria.setUserId(userId);
        return criteria;
    }
}
