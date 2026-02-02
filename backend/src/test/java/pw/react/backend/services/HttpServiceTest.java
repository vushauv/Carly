package pw.react.backend.services;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles({"it"})
@Disabled
class HttpServiceTest {
    @Autowired
    private RestTemplate restTemplate;
    @Value("${azure.backend.url}")
    private String azureUrl;

    @Test
    void givenUserNameAndPassword_whenLogin_thenReceiveToken() {
        HttpHeaders headers = new HttpHeaders();

//WSE: I have no idea what this fucker is but it references Company so we have to kill him
//might come in handy for some tests later IDK
//        final ResponseEntity<List<CreateCompanyRequest>> response3 = restTemplate.exchange(
//                azureUrl + "/companies",
//                HttpMethod.GET,
//                new HttpEntity<>(headers),
//                new ParameterizedTypeReference<>() {}
//        );
//
//        assertNotNull(response3.getBody());
    }
}