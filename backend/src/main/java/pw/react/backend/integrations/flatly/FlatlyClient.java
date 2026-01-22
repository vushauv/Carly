package pw.react.backend.integrations.flatly;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import pw.react.backend.integrations.flatly.dto.FlatlyCreateBookingRequest;
import pw.react.backend.integrations.flatly.dto.FlatlyCreateBookingResponse;

@Component
@RequiredArgsConstructor
public class FlatlyClient {

    private final RestTemplate restTemplate;

    //path to application.yml param
    @Value("${integrations.flatly.base-url}")
    private String baseUrl;

    // Toggle for tests
    // In prod set to false or remove later
    private final boolean mockMode = true;

    private int mockFlatBookingId = 100;

    public  ResponseEntity<FlatlyCreateBookingResponse> createBooking(FlatlyCreateBookingRequest request) {
        if (mockMode) {
            FlatlyCreateBookingResponse body = new FlatlyCreateBookingResponse();
            body.setId(mockFlatBookingId++);
            body.setStatus("CREATED");
            return ResponseEntity.status(HttpStatus.CREATED).body(body);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<FlatlyCreateBookingRequest> entity = new HttpEntity<>(request, headers);

        return restTemplate.exchange(
                baseUrl + "/bookings",
                HttpMethod.POST,
                entity,
                FlatlyCreateBookingResponse.class
        );
    }

    public ResponseEntity<Void> cancelBooking(Integer flatBookingId) {

        if (mockMode) {
            return ResponseEntity.ok().build();
        }

        HttpHeaders headers = new HttpHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        return restTemplate.exchange(
                baseUrl + "/bookings/" + flatBookingId,
                HttpMethod.DELETE,
                entity,
                Void.class
        );
    }
}
