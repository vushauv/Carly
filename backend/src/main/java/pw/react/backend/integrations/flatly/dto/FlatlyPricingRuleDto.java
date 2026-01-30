package pw.react.backend.integrations.flatly.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class FlatlyPricingRuleDto {

    private Integer id;

    @JsonProperty("flat_id")
    private Integer flatId;

    @JsonProperty("rule_type")
    private String ruleType; // RANGE / DAY

    @JsonProperty("is_active")
    private Boolean isActive;

    @JsonProperty("start_date")
    private LocalDate startDate;

    @JsonProperty("end_date")
    private LocalDate endDate;

    @JsonProperty("day_rate")
    private LocalDate dayRate;

    @JsonProperty("price_per_night")
    private BigDecimal pricePerNight;

    @JsonProperty("min_nights")
    private Integer minNights;

    @JsonProperty("cleaning_fee")
    private BigDecimal cleaningFee;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
