package dev.aiddbot.abjavareact.health;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class HealthServiceTest {

  private static final Instant FIXED = Instant.parse("2026-05-29T10:00:00Z");

  @Mock
  private HealthCheckRepository repository;

  @Test
  void reportsUpAndPersistsWhenDatabaseReachable() {
    given(repository.count()).willReturn(0L);
    HealthService service = new HealthService(repository, Clock.fixed(FIXED, ZoneOffset.UTC));

    HealthResponse response = service.check();

    assertThat(response.status()).isEqualTo("UP");
    assertThat(response.database()).isEqualTo("UP");
    assertThat(response.timestamp()).isEqualTo("2026-05-29T10:00:00Z");
    assertThat(response.uptime().since()).isEqualTo("2026-05-29T10:00:00Z");

    ArgumentCaptor<HealthCheck> captor = ArgumentCaptor.forClass(HealthCheck.class);
    verify(repository).save(captor.capture());
    assertThat(captor.getValue().getStatus()).isEqualTo("UP");
    assertThat(captor.getValue().getDatabaseStatus()).isEqualTo("UP");
    assertThat(captor.getValue().getCheckedAt()).isEqualTo("2026-05-29T10:00:00Z");
  }

  @Test
  void reportsDownWithoutThrowingWhenDatabaseProbeFails() {
    given(repository.count()).willThrow(new RuntimeException("connection refused"));
    given(repository.save(any(HealthCheck.class))).willThrow(new RuntimeException("connection refused"));
    HealthService service = new HealthService(repository, Clock.fixed(FIXED, ZoneOffset.UTC));

    HealthResponse response = service.check();

    assertThat(response.status()).isEqualTo("DOWN");
    assertThat(response.database()).isEqualTo("DOWN");
  }

  @Test
  void computesUptimeAsWholeSecondsSinceStart() {
    Clock clock = org.mockito.Mockito.mock(Clock.class);
    given(clock.instant()).willReturn(FIXED, FIXED.plusSeconds(3725));
    given(repository.count()).willReturn(0L);
    HealthService service = new HealthService(repository, clock);

    HealthResponse response = service.check();

    assertThat(response.uptime().seconds()).isEqualTo(3725L);
    assertThat(response.uptime().since()).isEqualTo("2026-05-29T10:00:00Z");
    assertThat(response.timestamp()).isEqualTo("2026-05-29T11:02:05Z");
  }
}
