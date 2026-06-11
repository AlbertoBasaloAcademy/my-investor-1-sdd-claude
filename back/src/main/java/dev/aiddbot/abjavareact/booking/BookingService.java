package dev.aiddbot.abjavareact.booking;

import dev.aiddbot.abjavareact.launch.Launch;
import dev.aiddbot.abjavareact.launch.LaunchNotFoundException;
import dev.aiddbot.abjavareact.launch.LaunchRepository;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

  private static final Pattern EMAIL_FORMAT = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

  private final BookingRepository repository;
  private final LaunchRepository launchRepository;

  public BookingService(BookingRepository repository, LaunchRepository launchRepository) {
    this.repository = repository;
    this.launchRepository = launchRepository;
  }

  public BookingResponse createBooking(BookingRequest request) {
    validate(request);
    if (repository.existsByLaunchIdAndPassengerEmail(request.launchId(), request.passengerEmail())) {
      throw new IllegalStateException("Duplicate booking");
    }
    Launch launch = launchRepository.findById(request.launchId())
        .orElseThrow(() -> new LaunchNotFoundException(request.launchId()));
    Booking booking = new Booking(launch, request.passengerName(), request.passengerEmail(), request.passengerPhone());
    return BookingResponse.from(repository.save(booking));
  }

  public BookingResponse cancelBooking(Long id) {
    Booking booking = repository.findById(id)
        .orElseThrow(() -> new BookingNotFoundException(id));
    if (!Booking.STATUS_CREATED.equals(booking.getStatus())) {
      throw new IllegalStateException("Booking already cancelled");
    }
    booking.setStatus(Booking.STATUS_CANCELLED);
    return BookingResponse.from(repository.save(booking));
  }

  public List<BookingResponse> getBookingsByLaunch(String launchId) {
    return repository.findByLaunchId(launchId).stream().map(BookingResponse::from).toList();
  }

  public List<BookingResponse> getBookingsByEmail(String email) {
    return repository.findByPassengerEmail(email).stream().map(BookingResponse::from).toList();
  }

  private void validate(BookingRequest request) {
    if (request.launchId() == null || request.launchId().isBlank()) {
      throw new IllegalArgumentException("Launch is required");
    }
    if (request.passengerName() == null || request.passengerName().isBlank()) {
      throw new IllegalArgumentException("Passenger name is required");
    }
    if (request.passengerEmail() == null || !EMAIL_FORMAT.matcher(request.passengerEmail()).matches()) {
      throw new IllegalArgumentException("Passenger email must be a valid email address");
    }
    if (request.passengerPhone() == null || request.passengerPhone().isBlank()) {
      throw new IllegalArgumentException("Passenger phone is required");
    }
  }
}
