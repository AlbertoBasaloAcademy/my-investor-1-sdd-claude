package dev.aiddbot.abjavareact.booking;

import dev.aiddbot.abjavareact.launch.Launch;
import dev.aiddbot.abjavareact.launch.LaunchNotFoundException;
import dev.aiddbot.abjavareact.launch.LaunchRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

  private final BookingRepository repository;
  private final LaunchRepository launchRepository;

  public BookingService(BookingRepository repository, LaunchRepository launchRepository) {
    this.repository = repository;
    this.launchRepository = launchRepository;
  }

  public BookingResponse createBooking(BookingRequest request) {
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
    if (!"CREATED".equals(booking.getStatus())) {
      throw new IllegalStateException("Booking already cancelled");
    }
    booking.setStatus("CANCELLED");
    return BookingResponse.from(repository.save(booking));
  }

  public List<BookingResponse> getBookingsByLaunch(String launchId) {
    return repository.findByLaunchId(launchId).stream().map(BookingResponse::from).toList();
  }

  public List<BookingResponse> getBookingsByEmail(String email) {
    return repository.findByPassengerEmail(email).stream().map(BookingResponse::from).toList();
  }
}
