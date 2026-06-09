package dev.aiddbot.abjavareact.launch;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/launches")
public class LaunchController {

  private final LaunchService service;

  public LaunchController(LaunchService service) {
    this.service = service;
  }

  @GetMapping
  public ResponseEntity<List<LaunchResponse>> findAll() {
    return ResponseEntity.ok(service.findAll());
  }

  @PostMapping
  public ResponseEntity<LaunchResponse> create(@RequestBody LaunchRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
  }

  @PutMapping("/{id}")
  public ResponseEntity<LaunchResponse> update(@PathVariable String id, @RequestBody LaunchRequest request) {
    return ResponseEntity.ok(service.update(id, request));
  }

  @PostMapping("/{id}/confirm")
  public ResponseEntity<LaunchResponse> confirm(@PathVariable String id) {
    return ResponseEntity.ok(service.confirm(id));
  }

  @PostMapping("/{id}/cancel")
  public ResponseEntity<LaunchResponse> cancel(@PathVariable String id) {
    return ResponseEntity.ok(service.cancel(id));
  }
}
