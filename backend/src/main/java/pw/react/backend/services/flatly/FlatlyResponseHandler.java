package pw.react.backend.services.flatly;

import lombok.experimental.UtilityClass;
import org.springframework.http.HttpStatusCode;
import pw.react.backend.exceptions.ResourceNotFoundException;

import java.util.UUID;

@UtilityClass
public class FlatlyResponseHandler {

    public void assertCreateBooking(HttpStatusCode status) {
        int code = status.value();

        if (code == 201) return;

        // expected errors from Flatly spec
        if (code == 409) {
            throw new IllegalStateException("Flatly: flat not available for given period (409).");
        }
        if (code == 400) {
            throw new IllegalStateException("Flatly: bad request (400). Check dateFrom/dateTo/guestsCount/source_ref.");
        }
        if (code == 404) {
            throw new ResourceNotFoundException("Flatly: flat not found (404).");
        }

        // unexpected
        throw new IllegalStateException("Flatly: unexpected response status=" + code + " during create booking.");
    }

    public void assertCancelBooking(HttpStatusCode status, UUID flatBookingId) {
        int code = status.value();

        // Flatly returns 204 on successful cancellation, but may also return 200.
        // Additionally, 404 indicates the booking does not exist on provider side
        // which we treat as idempotent-success (already cancelled or never existed).
        if (code == 200 || code == 204 || code == 404) return;

        throw new IllegalStateException("Flatly: unexpected response status=" + code + " during cancel booking.");
    }

    public void assertOk(HttpStatusCode status, String operation) {
        int code = status.value();
        if (code == 200) return;
        throw new IllegalStateException("Flatly: unexpected response status=" + code + " during " + operation + ".");
    }
}
