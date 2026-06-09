package dev.aiddbot.abjavareact.rocket;

import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class RocketService {

  private static final Set<String> VALID_RANGES = Set.of("Earth", "Moon", "Mars");

  private final RocketRepository repository;

  public RocketService(RocketRepository repository) {
    this.repository = repository;
  }

  public List<RocketResponse> findAll() {
    return repository.findAll().stream().map(RocketResponse::from).toList();
  }

  public RocketResponse create(RocketRequest request) {
    validate(request);
    if (repository.existsByName(request.name())) {
      throw new IllegalArgumentException("Rocket name already exists: " + request.name());
    }
    Rocket rocket = new Rocket(request.name(), request.capacity(), request.range());
    return RocketResponse.from(repository.save(rocket));
  }

  public RocketResponse update(String id, RocketRequest request) {
    Rocket rocket = repository.findById(id)
        .orElseThrow(() -> new RocketNotFoundException(id));
    validate(request);
    if (repository.existsByNameAndIdNot(request.name(), id)) {
      throw new IllegalArgumentException("Rocket name already exists: " + request.name());
    }
    rocket.setName(request.name());
    rocket.setCapacity(request.capacity());
    rocket.setRange(request.range());
    return RocketResponse.from(repository.save(rocket));
  }

  public void decommission(String id) {
    if (!repository.existsById(id)) {
      throw new RocketNotFoundException(id);
    }
    repository.deleteById(id);
  }

  private void validate(RocketRequest request) {
    if (request.name() == null || request.name().isBlank()) {
      throw new IllegalArgumentException("Rocket name is required");
    }
    if (request.capacity() == null || request.capacity() < 1 || request.capacity() > 9) {
      throw new IllegalArgumentException("Capacity must be between 1 and 9");
    }
    if (request.range() == null || !VALID_RANGES.contains(request.range())) {
      throw new IllegalArgumentException("Range must be one of: Earth, Moon, Mars");
    }
  }
}
