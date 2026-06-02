package dev.aiddbot.abjavareact.health;

import dev.aiddbot.abjavareact.health.HealthResponse.Uptime;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

  private static final String UP = "UP";
  private static final String DOWN = "DOWN";

  private final HealthCheckRepository repository;
  private final Clock clock;
  private final Instant startedAt;

  @Autowired
  public HealthService(HealthCheckRepository repository) {
    this(repository, Clock.systemUTC());
  }

  HealthService(HealthCheckRepository repository, Clock clock) {
    this.repository = repository;
    this.clock = clock;
    this.startedAt = clock.instant().truncatedTo(ChronoUnit.SECONDS);
  }

  public HealthResponse check() {
    Instant now = clock.instant().truncatedTo(ChronoUnit.SECONDS);
    boolean databaseUp = probeDatabase();
    String databaseStatus = databaseUp ? UP : DOWN;
    String status = databaseUp ? UP : DOWN;
    long uptimeSeconds = Math.max(0L, Duration.between(startedAt, now).toSeconds());
    String checkedAt = now.toString();

    persistQuietly(status, databaseStatus, uptimeSeconds, checkedAt);

    return new HealthResponse(status, databaseStatus, new Uptime(uptimeSeconds, startedAt.toString()), checkedAt);
  }

  private boolean probeDatabase() {
    try {
      repository.count();
      return true;
    } catch (RuntimeException ex) {
      return false;
    }
  }

  private void persistQuietly(String status, String databaseStatus, long uptimeSeconds, String checkedAt) {
    try {
      repository.save(new HealthCheck(status, databaseStatus, uptimeSeconds, checkedAt));
    } catch (RuntimeException ex) {
      // A probe must never propagate persistence failures to the client.
    }
  }
}
