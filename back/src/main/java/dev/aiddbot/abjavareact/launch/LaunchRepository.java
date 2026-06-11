package dev.aiddbot.abjavareact.launch;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LaunchRepository extends JpaRepository<Launch, String> {

  @Override
  @EntityGraph(attributePaths = "rocket")
  List<Launch> findAll();
}
