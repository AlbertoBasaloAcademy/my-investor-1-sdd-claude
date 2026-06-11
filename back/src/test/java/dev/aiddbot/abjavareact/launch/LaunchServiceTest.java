package dev.aiddbot.abjavareact.launch;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

import dev.aiddbot.abjavareact.booking.BookingRepository;
import dev.aiddbot.abjavareact.rocket.Rocket;
import dev.aiddbot.abjavareact.rocket.RocketRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LaunchServiceTest {

  @Mock
  private LaunchRepository repository;

  @Mock
  private RocketRepository rocketRepository;

  @Mock
  private BookingRepository bookingRepository;

  @InjectMocks
  private LaunchService service;

  private static final LocalDateTime FUTURE = LocalDateTime.now().plusDays(7);
  private static final BigDecimal PRICE = new BigDecimal("999.99");

  @Test
  void createReturnsSavedLaunch() {
    Rocket rocket = rocketWithId("r1", "Falcon", 5, "Moon");
    given(rocketRepository.findById("r1")).willReturn(Optional.of(rocket));
    Launch saved = launchWithId("L1", rocket, FUTURE, PRICE, 3, "created");
    given(repository.save(any(Launch.class))).willReturn(saved);

    LaunchResponse response = service.create(new LaunchRequest("r1", FUTURE, PRICE, 3));

    assertThat(response.rocketId()).isEqualTo("r1");
    assertThat(response.status()).isEqualTo("created");
    assertThat(response.minimumOccupancy()).isEqualTo(3);
  }

  @Test
  void createThrowsWhenRocketNotFound() {
    given(rocketRepository.findById("bad")).willReturn(Optional.empty());

    assertThatThrownBy(() -> service.create(new LaunchRequest("bad", FUTURE, PRICE, 1)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Rocket not found");
  }

  @Test
  void createThrowsWhenScheduledAtInPast() {
    Rocket rocket = rocketWithId("r1", "Falcon", 5, "Moon");
    given(rocketRepository.findById("r1")).willReturn(Optional.of(rocket));

    assertThatThrownBy(() -> service.create(new LaunchRequest("r1", LocalDateTime.now().minusHours(1), PRICE, 1)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("future");
  }

  @Test
  void createThrowsWhenPriceIsZero() {
    Rocket rocket = rocketWithId("r1", "Falcon", 5, "Moon");
    given(rocketRepository.findById("r1")).willReturn(Optional.of(rocket));

    assertThatThrownBy(() -> service.create(new LaunchRequest("r1", FUTURE, BigDecimal.ZERO, 1)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Price");
  }

  @Test
  void createThrowsWhenOccupancyExceedsCapacity() {
    Rocket rocket = rocketWithId("r1", "Falcon", 5, "Moon");
    given(rocketRepository.findById("r1")).willReturn(Optional.of(rocket));

    assertThatThrownBy(() -> service.create(new LaunchRequest("r1", FUTURE, PRICE, 6)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("capacity");
  }

  @Test
  void findAllReturnsMappedList() {
    Rocket rocket = rocketWithId("r1", "Falcon", 5, "Moon");
    given(repository.findAll()).willReturn(List.of(
        launchWithId("L1", rocket, FUTURE, PRICE, 3, "created"),
        launchWithId("L2", rocket, FUTURE.plusDays(1), PRICE, 2, "confirmed")
    ));

    List<LaunchResponse> launches = service.findAll();

    assertThat(launches).hasSize(2);
    assertThat(launches.get(0).status()).isEqualTo("created");
    assertThat(launches.get(1).status()).isEqualTo("confirmed");
  }

  @Test
  void confirmChangesStatusToConfirmed() {
    Rocket rocket = rocketWithId("r1", "Falcon", 5, "Moon");
    Launch launch = launchWithId("L1", rocket, FUTURE, PRICE, 3, "created");
    given(repository.findById("L1")).willReturn(Optional.of(launch));
    given(repository.save(launch)).willReturn(launchWithId("L1", rocket, FUTURE, PRICE, 3, "confirmed"));

    LaunchResponse response = service.confirm("L1");

    assertThat(response.status()).isEqualTo("confirmed");
  }

  @Test
  void confirmThrowsWhenNotInCreatedStatus() {
    Rocket rocket = rocketWithId("r1", "Falcon", 5, "Moon");
    given(repository.findById("L1")).willReturn(
        Optional.of(launchWithId("L1", rocket, FUTURE, PRICE, 3, "confirmed")));

    assertThatThrownBy(() -> service.confirm("L1"))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("created");
  }

  @Test
  void cancelChangesStatusToCancelled() {
    Rocket rocket = rocketWithId("r1", "Falcon", 5, "Moon");
    Launch launch = launchWithId("L1", rocket, FUTURE, PRICE, 3, "confirmed");
    given(repository.findById("L1")).willReturn(Optional.of(launch));
    given(repository.save(launch)).willReturn(launchWithId("L1", rocket, FUTURE, PRICE, 3, "cancelled"));

    LaunchResponse response = service.cancel("L1");

    assertThat(response.status()).isEqualTo("cancelled");
  }

  @Test
  void cancelThrowsWhenAlreadyCancelled() {
    Rocket rocket = rocketWithId("r1", "Falcon", 5, "Moon");
    given(repository.findById("L1")).willReturn(
        Optional.of(launchWithId("L1", rocket, FUTURE, PRICE, 3, "cancelled")));

    assertThatThrownBy(() -> service.cancel("L1"))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("cancelled");
  }

  @Test
  void updateThrowsWhenNotInCreatedStatus() {
    Rocket rocket = rocketWithId("r1", "Falcon", 5, "Moon");
    given(repository.findById("L1")).willReturn(
        Optional.of(launchWithId("L1", rocket, FUTURE, PRICE, 3, "confirmed")));

    assertThatThrownBy(() -> service.update("L1", new LaunchRequest("r1", FUTURE, PRICE, 2)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("created");
  }

  @Test
  void confirmThrowsWhenNotFound() {
    given(repository.findById("bad")).willReturn(Optional.empty());

    assertThatThrownBy(() -> service.confirm("bad"))
        .isInstanceOf(LaunchNotFoundException.class);
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

  private Launch launchWithId(String id, Rocket rocket, LocalDateTime scheduledAt,
      BigDecimal price, int occupancy, String status) {
    Launch l = new Launch(rocket, scheduledAt, price, occupancy);
    l.setStatus(status);
    try {
      var field = Launch.class.getDeclaredField("id");
      field.setAccessible(true);
      field.set(l, id);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    return l;
  }
}
