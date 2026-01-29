package pw.react.backend.integrations.flatly.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class FlatlyBookingDto {

    private Integer id;

    @JsonProperty("flat_id")
    private Integer flatId;

    @JsonProperty("user_id")
    private Integer userId;

    @JsonProperty("source_ref")
    private Integer sourceRef;

    @JsonProperty("check_in_date")
    private LocalDate checkInDate;

    @JsonProperty("check_out_date")
    private LocalDate checkOutDate;

    @JsonProperty("guests_count")
    private Integer guestsCount;

    @JsonProperty("price_per_night")
    private BigDecimal pricePerNight;

    @JsonProperty("total_price")
    private BigDecimal totalPrice;

    private String currency;
    private String status;

    private String comment;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @JsonProperty("cancelled_at")
    private LocalDateTime cancelledAt;
}
