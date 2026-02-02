package pw.react.backend.integrations.flatly.dto.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class FlatlyCreateBookingResponse {
    private java.util.UUID id;
    private String status; //flatly's internal status, for logging

    @JsonProperty("price_per_night")
    private BigDecimal pricePerNight;

    @JsonProperty("total_price")
    private BigDecimal totalPrice;

    private String currency;
}

