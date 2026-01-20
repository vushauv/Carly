package pw.react.backend.repositories.booking;

import org.springframework.data.jpa.domain.Specification;
import pw.react.backend.domain.booking.Booking;

import java.time.LocalDateTime;

//this fucker does some magic, it allows us to filer by given query params while gracefully handling null values, so we can pass
//only userId=10 and it will filter only by that
public final class BookingSpecifications {

    private BookingSpecifications() { }

    public static Specification<Booking> isEnabled() {
        return (root, query, cb) -> cb.isTrue(root.get("isEnabled"));
    }

    public static Specification<Booking> hasBookingId(Integer bookingId) {
        return (root, query, cb) -> bookingId == null
                ? cb.conjunction()
                : cb.equal(root.get("bookingId"), bookingId);
    }

    public static Specification<Booking> hasUserId(Integer userId) {
        return (root, query, cb) -> userId == null
                ? cb.conjunction()
                : cb.equal(root.get("user").get("userId"), userId);
    }

    public static Specification<Booking> hasStatusName(String statusName) {
        return (root, query, cb) -> (statusName == null || statusName.isBlank())
                ? cb.conjunction()
                : cb.equal(cb.upper(root.get("carBookingStatus").get("name")), statusName.toUpperCase());
    }

    public static Specification<Booking> dateFrom(LocalDateTime from) {
        return (root, query, cb) -> from == null
                ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("carBookingDateFrom"), from);
    }

    public static Specification<Booking> dateTo(LocalDateTime to) {
        return (root, query, cb) -> to == null
                ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("carBookingDateTo"), to);
    }
}
