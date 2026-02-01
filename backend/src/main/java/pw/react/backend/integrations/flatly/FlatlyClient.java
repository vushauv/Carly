package pw.react.backend.integrations.flatly;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import pw.react.backend.integrations.flatly.dto.requests.FlatlyCreateBookingRequest;
import pw.react.backend.integrations.flatly.dto.responses.FlatlyCreateBookingResponse;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import java.util.List;
import pw.react.backend.integrations.flatly.dto.FlatlyFlatDto;
import java.time.LocalDateTime;
import java.net.URI;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.*;
import pw.react.backend.integrations.flatly.dto.FlatlyBookingDto;

@Component
@RequiredArgsConstructor
public class FlatlyClient {
    private final RestTemplate restTemplate;

    //path to application.yml param
    @Value("$http://localhost:8080") //TODO: add environment variable!!!
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

    public ResponseEntity<List<FlatlyFlatDto>> getAvailableBookings(
            LocalDateTime dateFrom,
            LocalDateTime dateTo
    ) {

        if (mockMode) {
            FlatlyFlatDto flat = new FlatlyFlatDto();
            flat.setId(69);
            flat.setName("Mock Flat");
            flat.setDescription("Mock flat available in given period");
            flat.setStatus("ACTIVE");

            return ResponseEntity.ok(List.of(flat));
        }

        URI uri = UriComponentsBuilder
                .fromHttpUrl(baseUrl + "/flats/available")
                .queryParam("dateFrom", dateFrom)
                .queryParam("dateTo", dateTo)
                .build()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        return restTemplate.exchange(
                uri,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<List<FlatlyFlatDto>>() {}
        );
    }
    public ResponseEntity<FlatlyFlatDto> getFlatById(Integer flatId) {

        if (mockMode) {
            FlatlyFlatDto flat = new FlatlyFlatDto();
            flat.setId(flatId);
            flat.setName("Mock Flat");
            flat.setDescription("Mock flat details returned by FlatlyClient in mockMode");
            flat.setStatus("ACTIVE");
            return ResponseEntity.ok(flat);
        }

        HttpHeaders headers = new HttpHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        return restTemplate.exchange(
                baseUrl + "/flats/" + flatId,
                HttpMethod.GET,
                entity,
                FlatlyFlatDto.class
        );
    }

    public ResponseEntity<FlatlyBookingDto> getFlatBookingById(Integer flatBookingId) {

        if (mockMode) {
            FlatlyBookingDto b = new FlatlyBookingDto();
            b.setId(flatBookingId);
            b.setStatus("CONFIRMED");
            return ResponseEntity.ok(b);
        }

        HttpHeaders headers = new HttpHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        return restTemplate.exchange(
                baseUrl + "/bookings/" + flatBookingId,
                HttpMethod.GET,
                entity,
                FlatlyBookingDto.class
        );
    }


}
