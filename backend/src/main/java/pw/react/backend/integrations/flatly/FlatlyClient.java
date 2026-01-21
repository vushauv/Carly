package pw.react.backend.integrations.flatly;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import pw.react.backend.integrations.flatly.dto.FlatlyCancelBookingResponse;
import pw.react.backend.integrations.flatly.dto.FlatlyCreateBookingRequest;
import pw.react.backend.integrations.flatly.dto.FlatlyCreateBookingResponse;

@Component
@RequiredArgsConstructor
public class FlatlyClient {

    private final RestTemplate restTemplate;

    //path to application.yml param
    @Value("${integrations.flatly.base-url0")
    private String baseUrl;

    public FlatlyCreateBookingResponse createBooking(FlatlyCreateBookingRequest request) {
        //tests
        FlatlyCreateBookingResponse response = new FlatlyCreateBookingResponse();

        response.setFlatBookingId(
                request.getBookingId() != null
                        ? request.getBookingId()
                        : System.currentTimeMillis()
        );
        response.setStatus("CREATED");

        return response;
//prod:
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        HttpEntity<FlatlyCreateBookingRequest> entity = new HttpEntity<>(request, headers);
//
//        ResponseEntity<FlatlyCreateBookingResponse> response = restTemplate.exchange(
//                baseUrl + "/bookings",
//                HttpMethod.POST,
//                entity,
//                FlatlyCreateBookingResponse.class
//        );
//
//        return response.getBody();
    }

    public FlatlyCancelBookingResponse cancelBooking(Long flatBookingId) {
        //tests
        FlatlyCancelBookingResponse response = new FlatlyCancelBookingResponse();
        response.setCancelled(true);

        return response;

        //prod:
//        HttpHeaders headers = new HttpHeaders();
//        HttpEntity<Void> entity = new HttpEntity<>(headers);
//
//        ResponseEntity<FlatlyCancelBookingResponse> response = restTemplate.exchange(
//                baseUrl + "/bookings/" + flatBookingId,
//                HttpMethod.DELETE,
//                entity,
//                FlatlyCancelBookingResponse.class
//        );
//
//        return response.getBody();
    }
}
