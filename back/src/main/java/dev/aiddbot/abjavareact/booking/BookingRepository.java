package dev.aiddbot.abjavareact.booking;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

  @EntityGraph(attributePaths = "launch")
  List<Booking> findByLaunchId(String launchId);

  @EntityGraph(attributePaths = "launch")
  List<Booking> findByPassengerEmail(String email);

  boolean existsByLaunchIdAndPassengerEmail(String launchId, String email);
}
