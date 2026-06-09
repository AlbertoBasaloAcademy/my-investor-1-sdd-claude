package dev.aiddbot.abjavareact.rocket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RocketServiceTest {

  @Mock
  private RocketRepository repository;

  @InjectMocks
  private RocketService service;

  @Test
  void createReturnsSavedRocket() {
    RocketRequest request = new RocketRequest("Falcon", 5, "Moon");
    Rocket saved = rocketWithId("1", "Falcon", 5, "Moon");
    given(repository.existsByName("Falcon")).willReturn(false);
    given(repository.save(any(Rocket.class))).willReturn(saved);

    RocketResponse response = service.create(request);

    assertThat(response.name()).isEqualTo("Falcon");
    assertThat(response.capacity()).isEqualTo(5);
    assertThat(response.range()).isEqualTo("Moon");
  }

  @Test
  void createThrowsWhenNameAlreadyExists() {
    given(repository.existsByName("Falcon")).willReturn(true);

    assertThatThrownBy(() -> service.create(new RocketRequest("Falcon", 5, "Moon")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("already exists");
  }

  @Test
  void createThrowsWhenCapacityOutOfRange() {
    assertThatThrownBy(() -> service.create(new RocketRequest("Nova", 0, "Earth")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Capacity");

    assertThatThrownBy(() -> service.create(new RocketRequest("Nova", 10, "Earth")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Capacity");
  }

  @Test
  void createThrowsWhenRangeInvalid() {
    assertThatThrownBy(() -> service.create(new RocketRequest("Nova", 3, "Jupiter")))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Range");
  }

  @Test
  void findAllReturnsMappedList() {
    given(repository.findAll()).willReturn(List.of(
        rocketWithId("1", "Falcon", 5, "Moon"),
        rocketWithId("2", "Titan", 9, "Mars")
    ));

    List<RocketResponse> rockets = service.findAll();

    assertThat(rockets).hasSize(2);
    assertThat(rockets.get(0).name()).isEqualTo("Falcon");
    assertThat(rockets.get(1).name()).isEqualTo("Titan");
  }

  @Test
  void updateModifiesExistingRocket() {
    Rocket existing = rocketWithId("1", "Falcon", 5, "Moon");
    Rocket updated = rocketWithId("1", "Falcon-9", 7, "Mars");
    given(repository.findById("1")).willReturn(Optional.of(existing));
    given(repository.existsByNameAndIdNot("Falcon-9", "1")).willReturn(false);
    given(repository.save(existing)).willReturn(updated);

    RocketResponse response = service.update("1", new RocketRequest("Falcon-9", 7, "Mars"));

    assertThat(response.name()).isEqualTo("Falcon-9");
    assertThat(response.capacity()).isEqualTo(7);
    assertThat(response.range()).isEqualTo("Mars");
  }

  @Test
  void updateThrowsWhenRocketNotFound() {
    given(repository.findById("99")).willReturn(Optional.empty());

    assertThatThrownBy(() -> service.update("99", new RocketRequest("X", 1, "Earth")))
        .isInstanceOf(RocketNotFoundException.class);
  }

  @Test
  void decommissionDeletesRocket() {
    given(repository.existsById("1")).willReturn(true);

    service.decommission("1");

    verify(repository).deleteById("1");
  }

  @Test
  void decommissionThrowsWhenNotFound() {
    given(repository.existsById("99")).willReturn(false);

    assertThatThrownBy(() -> service.decommission("99"))
        .isInstanceOf(RocketNotFoundException.class);
  }

  private Rocket rocketWithId(String id, String name, int capacity, String range) {
    Rocket r = new Rocket(name, capacity, range);
    try {
      var field = Rocket.class.getDeclaredField("id");
      field.setAccessible(true);
      field.set(r, id);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    return r;
  }
}
