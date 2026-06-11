package dev.aiddbot.abjavareact.booking;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

  private final BookingService service;

  public BookingController(BookingService service) {
    this.service = service;
  }

  @PostMapping
  public ResponseEntity<BookingResponse> create(@RequestBody BookingRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.createBooking(request));
  }

  @PostMapping("/{id}/cancel")
  public ResponseEntity<BookingResponse> cancel(@PathVariable Long id) {
    return ResponseEntity.ok(service.cancelBooking(id));
  }

  @GetMapping(params = "launchId")
  public ResponseEntity<List<BookingResponse>> getByLaunch(@RequestParam String launchId) {
    return ResponseEntity.ok(service.getBookingsByLaunch(launchId));
  }

  @GetMapping(params = "email")
  public ResponseEntity<List<BookingResponse>> getByEmail(@RequestParam String email) {
    return ResponseEntity.ok(service.getBookingsByEmail(email));
  }
}
