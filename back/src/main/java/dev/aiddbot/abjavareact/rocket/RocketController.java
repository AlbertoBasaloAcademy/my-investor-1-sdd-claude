package dev.aiddbot.abjavareact.rocket;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rockets")
public class RocketController {

  private final RocketService service;

  public RocketController(RocketService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<List<RocketResponse>> findAll() {
    return ResponseEntity.ok(service.findAll());
  }

  @PostMapping
  public ResponseEntity<RocketResponse> create(@RequestBody RocketRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
  }

  @PutMapping("/{id}")
  public ResponseEntity<RocketResponse> update(@PathVariable String id, @RequestBody RocketRequest request) {
    return ResponseEntity.ok(service.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> decommission(@PathVariable String id) {
    service.decommission(id);
    return ResponseEntity.noContent().build();
  }
}
