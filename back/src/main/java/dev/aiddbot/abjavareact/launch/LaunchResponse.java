package dev.aiddbot.abjavareact.launch;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LaunchResponse(
    String id,
    String rocketId,
    String rocketName,
    LocalDateTime scheduledAt,
    BigDecimal pricePerTicket,
    int minimumOccupancy,
    String status
) {

  static LaunchResponse from(Launch launch) {
    return new LaunchResponse(
        launch.getId(),
        launch.getRocket().getId(),
        launch.getRocket().getName(),
        launch.getScheduledAt(),
        launch.getPricePerTicket(),
        launch.getMinimumOccupancy(),
        launch.getStatus()
    );
  }
}
