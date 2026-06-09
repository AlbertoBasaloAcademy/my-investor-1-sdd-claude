package dev.aiddbot.abjavareact.launch;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LaunchRequest(
    String rocketId,
    LocalDateTime scheduledAt,
    BigDecimal pricePerTicket,
    Integer minimumOccupancy
) {
}
