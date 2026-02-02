package pw.react.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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

    @Operation(summary = "Retrieve reference data",
            description = """
        Returns system-defined reference (lookup) data used across search and booking workflows.
        These values are typically referenced by identifiers when creating resources.

        Specifying values in include is mandatory.
        The `include` parameter accepts a comma-separated list of reference data categories.
        Supported values include:
        - CAR_COLORS
        - CAR_BRANDS
        - CAR_FUEL_TYPES
        - CAR_MODELS
        - CAR_STATUSES
        - BOOKING_STATUSES
        - PICKUP_LOCATIONS
        - RETURN_LOCATIONS

        For convenience, simplified aliases are also accepted:
        `colors`, `brands`, `fuelType`, `models`, `status`,
        `bookingStatuses`, `pickupLocations`, and `returnLocations`, `bookingStatus`.

        All values are case-insensitive.

        Example:
        `/api/reference/data?include=colors,brands,pickupLocations`
        """
    )
    @ApiResponse(responseCode = "200", description = "Reference data successfully retrieved")
    @ApiResponse(responseCode = "422", description = "Request cannot be processed due to semantic validation errors")
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
