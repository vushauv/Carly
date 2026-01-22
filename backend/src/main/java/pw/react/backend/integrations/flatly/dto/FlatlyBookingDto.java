package pw.react.backend.integrations.flatly.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class FlatlyBookingDto {

    private Integer id;
    private Integer flatId;
    private Integer userId;

    //TODO: make Flatly store the period as 2 seperate columns...
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;

    private String status; // PENDING|CONFIRMED|CANCELLED|REJECTED
    private String createdVia; // OWN_MOBILE|OWN_ADMIN|PARTNER_API
    private String createdBySystem;
    private String partnerBookingRef;

    private BigDecimal priceTotal;
    private String currency;

    private LocalDateTime cancelledAt;
    private String cancelReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
