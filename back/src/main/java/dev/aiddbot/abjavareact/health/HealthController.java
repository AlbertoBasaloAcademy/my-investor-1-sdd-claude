package dev.aiddbot.abjavareact.health;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

  private final HealthService service;

  public HealthController(HealthService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<HealthResponse> health() {
    HealthResponse response = service.check();
    HttpStatus httpStatus = "UP".equals(response.status()) ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return ResponseEntity.status(httpStatus).body(response);
  }
}
