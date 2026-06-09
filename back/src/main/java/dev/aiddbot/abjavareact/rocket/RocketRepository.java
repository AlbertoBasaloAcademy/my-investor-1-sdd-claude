package dev.aiddbot.abjavareact.rocket;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RocketRepository extends JpaRepository<Rocket, String> {

  boolean existsByName(String name);

  boolean existsByNameAndIdNot(String name, String id);
}
