package pw.react.backend.integrations.flatly;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import pw.react.backend.integrations.flatly.dto.FlatlyCreateBookingRequest;
import pw.react.backend.integrations.flatly.dto.FlatlyCreateBookingResponse;

@Component
@RequiredArgsConstructor
public class FlatlyClient {

    private final RestTemplate restTemplate;

    //path to application.yml param
    @Value("${integrations.flatly.base-url0")
    private String baseUrl;

    //TODO: remove, used for tests
    private Integer FlatBookingId = 1;
    public FlatlyCreateBookingResponse createBooking(FlatlyCreateBookingRequest request) {
        //tests
        FlatlyCreateBookingResponse response = new FlatlyCreateBookingResponse();

        response.setId(FlatBookingId++);
        response.setStatus("CREATED");

        return response;

        //prod
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
//       TODO: if response code not 201 Created, retry!
//
//        return response.getBody();
    }

    public boolean cancelBooking(Integer flatBookingId) {
        //tests
//        FlatlyCancelBookingResponse response = new FlatlyCancelBookingResponse();
//        response.setCancelled(true);

        return true;

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
        //TODO: if not 200 Success, retry!
//
//        return response.getBody();
    }
}
