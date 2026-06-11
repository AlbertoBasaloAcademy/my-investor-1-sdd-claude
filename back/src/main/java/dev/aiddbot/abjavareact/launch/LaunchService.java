package dev.aiddbot.abjavareact.launch;

import dev.aiddbot.abjavareact.booking.BookingRepository;
import dev.aiddbot.abjavareact.rocket.Rocket;
import dev.aiddbot.abjavareact.rocket.RocketRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class LaunchService {

  private static final Set<String> TERMINAL_STATUSES = Set.of("completed", "cancelled");

  private final LaunchRepository repository;
  private final RocketRepository rocketRepository;
  private final BookingRepository bookingRepository;

  public LaunchService(LaunchRepository repository, RocketRepository rocketRepository, BookingRepository bookingRepository) {
    this.repository = repository;
    this.rocketRepository = rocketRepository;
    this.bookingRepository = bookingRepository;
  }

  public List<LaunchResponse> findAll() {
    return repository.findAll().stream().map(LaunchResponse::from).toList();
  }

  public LaunchResponse create(LaunchRequest request) {
    Rocket rocket = resolveRocket(request.rocketId());
    validateFields(request.scheduledAt(), request.pricePerTicket(), request.minimumOccupancy(), rocket);
    Launch launch = new Launch(rocket, request.scheduledAt(), request.pricePerTicket(), request.minimumOccupancy());
    return LaunchResponse.from(repository.save(launch));
  }

  public LaunchResponse update(String id, LaunchRequest request) {
    Launch launch = findOrThrow(id);
    if (!"created".equals(launch.getStatus())) {
      throw new IllegalArgumentException("Only launches in 'created' status can be updated");
    }
    Rocket rocket = resolveRocket(request.rocketId());
    validateFields(request.scheduledAt(), request.pricePerTicket(), request.minimumOccupancy(), rocket);
    launch.setRocket(rocket);
    launch.setScheduledAt(request.scheduledAt());
    launch.setPricePerTicket(request.pricePerTicket());
    launch.setMinimumOccupancy(request.minimumOccupancy());
    return LaunchResponse.from(repository.save(launch));
  }

  public LaunchResponse confirm(String id) {
    Launch launch = findOrThrow(id);
    if (!"created".equals(launch.getStatus())) {
      throw new IllegalStateException("Launch can only be confirmed from 'created' status");
    }
    launch.setStatus("confirmed");
    return LaunchResponse.from(repository.save(launch));
  }

  public LaunchResponse cancel(String id) {
    Launch launch = findOrThrow(id);
    if (TERMINAL_STATUSES.contains(launch.getStatus())) {
      throw new IllegalStateException("Launch in '" + launch.getStatus() + "' status cannot be cancelled");
    }
    launch.setStatus("cancelled");
    LaunchResponse response = LaunchResponse.from(repository.save(launch));
    bookingRepository.findByLaunchId(id).stream()
        .filter(b -> "CREATED".equals(b.getStatus()))
        .forEach(b -> {
          b.setStatus("CANCELLED");
          bookingRepository.save(b);
        });
    return response;
  }

  private Launch findOrThrow(String id) {
    return repository.findById(id).orElseThrow(() -> new LaunchNotFoundException(id));
  }

  private Rocket resolveRocket(String rocketId) {
    if (rocketId == null || rocketId.isBlank()) {
      throw new IllegalArgumentException("Rocket is required");
    }
    return rocketRepository.findById(rocketId)
        .orElseThrow(() -> new IllegalArgumentException("Rocket not found: " + rocketId));
  }

  private void validateFields(LocalDateTime scheduledAt, BigDecimal pricePerTicket, Integer minimumOccupancy, Rocket rocket) {
    if (scheduledAt == null || !scheduledAt.isAfter(LocalDateTime.now())) {
      throw new IllegalArgumentException("Launch time must be in the future");
    }
    if (pricePerTicket == null || pricePerTicket.compareTo(BigDecimal.ZERO) <= 0) {
      throw new IllegalArgumentException("Price per ticket must be greater than zero");
    }
    if (minimumOccupancy == null || minimumOccupancy < 1) {
      throw new IllegalArgumentException("Minimum occupancy must be greater than zero");
    }
    if (minimumOccupancy > rocket.getCapacity()) {
      throw new IllegalArgumentException(
          "Minimum occupancy cannot exceed rocket capacity of " + rocket.getCapacity());
    }
  }
}
