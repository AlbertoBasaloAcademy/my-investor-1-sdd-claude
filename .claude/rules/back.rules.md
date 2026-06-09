---
description: Code rules for the back container of AstroBookings
paths: ["back/src/**/*.java"]
---
# Back code rules — AstroBookings

## Summary

The back container uses a strict feature-slice layout: each feature folder (health, rocket, launch) owns its entity, repository, service, controller, DTOs, and exceptions. Business logic and validation live exclusively in the service layer; controllers are thin HTTP adapters. Constructor injection and Java records are the dominant modern-Java idioms.

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Folders | lowercase feature name | `rocket/`, `shared/` |
| Entity classes | `{Feature}` (no suffix) | `Rocket`, `Launch` |
| Repository interfaces | `{Feature}Repository` | `RocketRepository` |
| Service classes | `{Feature}Service` | `RocketService` |
| Controller classes | `{Feature}Controller` | `RocketController` |
| Request records | `{Feature}Request` | `RocketRequest` |
| Response records | `{Feature}Response` | `RocketResponse` |
| Exception classes | `{Feature}NotFoundException` | `LaunchNotFoundException` |
| Methods | camelCase | `findAll`, `decommission` |
| Constants | UPPER_SNAKE | `VALID_RANGES` |

## Artifact roles

| Role | Structural rule |
|------|----------------|
| Entity | `@Entity @Table(name="…")`; mutable (setters); UUID string PK for domain entities, Long for infra entities (HealthCheck) |
| Repository | `extends JpaRepository<Entity, IdType>`; add derived query methods as needed |
| Service | `@Service`; constructor-injected; owns validation and state-transition logic; maps entities → DTOs |
| Controller | `@RestController @RequestMapping`; constructor-injected; no logic beyond calling service and wrapping in `ResponseEntity` |
| Request | `record {Feature}Request(…)`; no validation annotations; validated in service |
| Response | `record {Feature}Response(…)` with `static from(Entity)` factory |
| Exception | `extends RuntimeException`; caught by `GlobalExceptionHandler` → 404 |
| GlobalExceptionHandler | `@RestControllerAdvice`; maps `NotFoundException` → 404, `IllegalArgumentException` → 400 |

## Canonical example

> `RocketService` — clean feature service with validation and CRUD.

```java
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

  public void decommission(String id) {
    if (!repository.existsById(id)) throw new RocketNotFoundException(id);
    repository.deleteById(id);
  }

  private void validate(RocketRequest request) {
    if (request.name() == null || request.name().isBlank())
      throw new IllegalArgumentException("Rocket name is required");
    if (request.capacity() == null || request.capacity() < 1 || request.capacity() > 9)
      throw new IllegalArgumentException("Capacity must be between 1 and 9");
    if (request.range() == null || !VALID_RANGES.contains(request.range()))
      throw new IllegalArgumentException("Range must be one of: Earth, Moon, Mars");
  }
}
```

## Conventions

- **Wiring**: Constructor injection only — no `@Autowired` on fields.
- **Errors**: Throw `IllegalArgumentException` for business-rule violations (→ 400), `{Feature}NotFoundException` for missing resources (→ 404); never catch in the service — let `GlobalExceptionHandler` handle it.
- **Testing**: One test class per layer per feature (`RocketServiceTest`, `HealthControllerTest`, `HealthCheckRepositoryTest`); `@ExtendWith(MockitoExtension.class)` for services, `@WebMvcTest` for controllers, `@DataJpaTest` for repositories; test class lives under `src/test/java/` mirroring the main package.
- **Avoid**: `@Autowired` field injection (breaks testability); `@Valid`/`@NotNull` on request records (validation is in service); business logic in controllers; serializing entity objects directly as responses (use `Response` records).
