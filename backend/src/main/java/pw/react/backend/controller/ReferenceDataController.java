package pw.react.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pw.react.backend.controller.path.PathResolver;
import pw.react.backend.domain.enums.ReferenceDataType;
import pw.react.backend.dto.response.reference.ReferenceDataDto;
import pw.react.backend.services.reference.ReferenceDataService;

import java.util.List;

import static java.util.stream.Collectors.joining;

@RestController
@RequestMapping(ReferenceDataController.REFERENCE_PATH)
@Slf4j
@RequiredArgsConstructor
public class ReferenceDataController {
    public static final String REFERENCE_PATH = PathResolver.Reference.Base;
    private final ReferenceDataService referenceDataService;

    @Operation(
            summary = "Get reference data for car search and booking",
            description = "Returns system-defined reference data (lookup values) used to populate car search and booking forms, such as locations and available car-related options."
    )
    @GetMapping("/data")
    public ResponseEntity<ReferenceDataDto> getReferenceData(
            HttpHeaders headers,
            @RequestParam(required = false, name = "include")
            List<ReferenceDataType> include
    )
    {
        logHeaders(headers);
        var res = referenceDataService.getReferenceData(include);
        return ResponseEntity.ok(res);
    }

    private void logHeaders(@RequestHeader HttpHeaders headers) {
        log.info(
                "Controller request headers {}",
                headers.entrySet()
                        .stream()
                        .map(e -> String.format("%s->[%s]", e.getKey(), String.join(",", e.getValue())))
                        .collect(joining(","))
        );
    }
}
