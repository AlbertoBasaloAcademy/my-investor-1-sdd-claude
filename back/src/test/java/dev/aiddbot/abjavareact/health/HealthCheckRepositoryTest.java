package dev.aiddbot.abjavareact.health;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
class HealthCheckRepositoryTest {

  @Autowired
  private HealthCheckRepository repository;

  @Test
  void persistsAndReadsBackHealthCheck() {
    HealthCheck saved = repository.save(new HealthCheck("UP", "UP", 42L, "2026-05-29T10:00:00Z"));

    assertThat(saved.getId()).isNotNull();
    assertThat(repository.findById(saved.getId()))
        .isPresent()
        .get()
        .satisfies(found -> {
          assertThat(found.getStatus()).isEqualTo("UP");
          assertThat(found.getDatabaseStatus()).isEqualTo("UP");
          assertThat(found.getUptimeSeconds()).isEqualTo(42L);
          assertThat(found.getCheckedAt()).isEqualTo("2026-05-29T10:00:00Z");
        });
  }
}
