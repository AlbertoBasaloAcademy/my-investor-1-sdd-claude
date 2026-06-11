package dev.aiddbot.abjavareact.booking;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

  List<Booking> findByLaunchId(String launchId);

  List<Booking> findByPassengerEmail(String email);

  boolean existsByLaunchIdAndPassengerEmail(String launchId, String email);
}
