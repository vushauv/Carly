package pw.react.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pw.react.backend.dto.response.*;
import pw.react.backend.exceptions.ResourceNotFoundException;

import java.util.*;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(path = BookingController.BOOKINGS_PATH)
@Slf4j
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class BookingController {

    //private final BookingService bookingService;
    //private final BookingMapper bookingMapper;

    public static final String BOOKINGS_PATH = "/bookings";

    private void logHeaders(@RequestHeader HttpHeaders headers) {
        log.info("Controller request headers {}",
                headers.entrySet()
                        .stream()
                        .map(entry -> String.format("%s->[%s]", entry.getKey(), String.join(",", entry.getValue())))
                        .collect(joining(","))
        );
    }

    @PostMapping(path = "")
    public ResponseEntity<Collection<Void>> createBooking(@RequestHeader HttpHeaders headers,
                                                            @RequestBody(required = false) Object body)
    {
        //TODO: decide what exactly goes in the request payload!
        logHeaders(headers);

        log.info("createBooking called – skeleton implementation");

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<String> getBookings(@RequestHeader HttpHeaders headers,
                                                    @RequestParam(required = false) Integer page,
                                                    @RequestParam(required = false) Integer size)
    {
        //TODO: implement query parameters to filter based on given criteria
        logHeaders(headers);
        log.info("getBookings called – skeleton implementation");

        return ResponseEntity.ok("getBookings called correctly!");
    }
    @GetMapping(path = "/{bookingId}")
    public ResponseEntity<String> getBooking(@RequestHeader HttpHeaders headers, @PathVariable Integer bookingId) {
        logHeaders(headers);
        //Get all details of a specific booking
        return ResponseEntity.ok(String.format("getBookings with bookingId=%d called correctly!", bookingId));
    }
    @PatchMapping(path = "/{bookingId}")
    //@ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<String> updateBooking(@RequestHeader HttpHeaders headers, @PathVariable Integer bookingId,
                              @Valid @RequestBody Integer updatedBooking) {
        logHeaders(headers);
        return ResponseEntity.ok(String.format("getBookings with bookingId=%d called correctly!", bookingId));
    }

    @DeleteMapping(path = "/{bookingId}")
    //@ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<String> deleteBooking(@RequestHeader HttpHeaders headers, @PathVariable Integer bookingId,
                                                @Valid @RequestBody Integer updatedBooking) {
        logHeaders(headers);
        return ResponseEntity.ok(String.format("deleteBooking with bookingId=%d called correctly!", bookingId));
    }


}
