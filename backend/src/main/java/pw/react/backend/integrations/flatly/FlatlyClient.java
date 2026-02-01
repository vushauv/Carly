package pw.react.backend.integrations.flatly;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import pw.react.backend.integrations.flatly.dto.*;
import pw.react.backend.integrations.flatly.dto.requests.FlatlyCreateBookingRequest;
import pw.react.backend.integrations.flatly.dto.responses.FlatlyCreateBookingResponse;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class FlatlyClient {

    private final RestTemplate restTemplate;

    @Value("${integrations.flatly.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${integrations.flatly.mock-mode:false}")
    private boolean mockMode;

    private int mockFlatBookingId = 1000;

    public ResponseEntity<FlatlyCreateBookingResponse> createBooking(FlatlyCreateBookingRequest request) {
        URI uri = UriComponentsBuilder
                .fromHttpUrl(baseUrl + "/bookings/external")
                .queryParam("source", "CARLY")
                .build()
                .toUri();

        return restTemplate.exchange(
                uri,
                HttpMethod.POST,
                new HttpEntity<>(request, jsonHeaders()),
                FlatlyCreateBookingResponse.class
        );
    }

    public ResponseEntity<Void> cancelBooking(UUID flatBookingId) {
        if (mockMode) {
            return ResponseEntity.ok().build();
        }

        return restTemplate.exchange(
                baseUrl + "/bookings/" + flatBookingId,
                HttpMethod.DELETE,
                new HttpEntity<>(jsonHeaders()),
                Void.class
        );
    }

    public ResponseEntity<FlatlyBookingDto> getFlatBookingById(UUID flatBookingId) {
        if (mockMode) {
            FlatlyBookingDto b = new FlatlyBookingDto();
            b.setId(flatBookingId);

            // IMPORTANT: needed so service can fetch /flats/{flatId}/images
            b.setFlatId(UUID.randomUUID());

            return ResponseEntity.ok(b);
        }

        return restTemplate.exchange(
                baseUrl + "/bookings/" + flatBookingId,
                HttpMethod.GET,
                new HttpEntity<>(jsonHeaders()),
                FlatlyBookingDto.class
        );
    }
    public ResponseEntity<FlatlyFlatDetailsDto> getFlatById(UUID flatId) {
        if (mockMode) {
            FlatlyFlatDetailsDto f = new FlatlyFlatDetailsDto();
            f.setId(flatId);
            f.setName("Mock Flat");
            f.setCity("Mock City");
            f.setCountry("Mock Country");
            f.setRooms(2);
            f.setMaxGuests(4);
            f.setLat(BigDecimal.valueOf(52.0));
            f.setLon(BigDecimal.valueOf(21.0));
            return ResponseEntity.ok(f);
        }

        return restTemplate.exchange(
                baseUrl + "/flats/" + flatId,
                HttpMethod.GET,
                new HttpEntity<>(jsonHeaders()),
                FlatlyFlatDetailsDto.class
        );
    }

    public ResponseEntity<List<FlatlyAvailableFlatDto>> getAvailableFlats(LocalDateTime dateFrom, LocalDateTime dateTo) {
        if (mockMode) {
            return ResponseEntity.ok(mockAvailableFlats());
        }

        // Flatly endpoint expects DATE (yyyy-MM-dd), not LocalDateTime
        URI uri = UriComponentsBuilder
                .fromHttpUrl(baseUrl + "/flats/available")
                .queryParam("dateFrom", dateFrom.toLocalDate())
                .queryParam("dateTo", dateTo.toLocalDate())
                .build()
                .toUri();

        ResponseEntity<FlatlyPageResponse<FlatlyAvailableFlatDto>> resp = restTemplate.exchange(
                uri,
                HttpMethod.GET,
                new HttpEntity<>(jsonHeaders()),
                new ParameterizedTypeReference<FlatlyPageResponse<FlatlyAvailableFlatDto>>() {}
        );

        List<FlatlyAvailableFlatDto> content =
                (resp.getBody() == null || resp.getBody().getContent() == null)
                        ? List.of()
                        : resp.getBody().getContent();

        // Return same status as partner, but with List body as your service expects
        return new ResponseEntity<>(content, resp.getHeaders(), resp.getStatusCode());
    }

    public ResponseEntity<List<FlatlyFlatImageDto>> getFlatImages(UUID flatId) {
        if (mockMode) {
            return ResponseEntity.ok(mockImages(flatId));
        }

        String url = baseUrl + "/flats/" + flatId + "/images";

        return restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(jsonHeaders()),
                new ParameterizedTypeReference<List<FlatlyFlatImageDto>>() {}
        );
    }



    // helpers for mock version of client

    private List<FlatlyAvailableFlatDto> mockAvailableFlats() {
        int count = ThreadLocalRandom.current().nextInt(2, 4);

        List<FlatlyAvailableFlatDto> flats = new ArrayList<>(count);

        flats.add(buildMockFlat(
                UUID.randomUUID(),
                "Mountain Apartment",
                "Zakopane",
                "Poland",
                2,
                5,
                49.2992,
                19.9496
        ));

        if (count >= 2) {
            flats.add(buildMockFlat(
                    UUID.randomUUID(),
                    "City Studio",
                    "Krakow",
                    "Poland",
                    1,
                    2,
                    50.0647,
                    19.9450
            ));
        }

        if (count >= 3) {
            flats.add(buildMockFlat(
                    UUID.randomUUID(),
                    "Seaside Loft",
                    "Gdansk",
                    "Poland",
                    3,
                    6,
                    54.3520,
                    18.6466
            ));
        }

        return flats;
    }

    private @NonNull FlatlyAvailableFlatDto buildMockFlat(
            UUID id,
            String name,
            String city,
            String country,
            int rooms,
            int maxGuests,
            double lat,
            double lon
    ) {
        FlatlyAvailableFlatDto f = new FlatlyAvailableFlatDto();
        f.setId(id);
        f.setName(name);
        f.setCity(city);
        f.setCountry(country);
        f.setRooms(rooms);
        f.setMaxGuests(maxGuests);
        f.setLat(BigDecimal.valueOf(lat));
        f.setLon(BigDecimal.valueOf(lon));
        return f;
    }

    private List<FlatlyFlatImageDto> mockImages(UUID flatId) {
        int count = ThreadLocalRandom.current().nextInt(2, 6);
        List<FlatlyFlatImageDto> images = new ArrayList<>(count);

        for (int i = 1; i <= count; i++) {
            FlatlyFlatImageDto img = new FlatlyFlatImageDto();
            img.setSortOrder(i);

            String url = "https://picsum.photos/seed/" + flatId + "-" + i + "/900/600";
            img.setImageUrl(url);

            images.add(img);
        }

        return images;
    }

    private HttpHeaders jsonHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setAccept(List.of(MediaType.APPLICATION_JSON));
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }
}
