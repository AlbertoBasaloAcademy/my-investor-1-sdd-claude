package dev.aiddbot.abjavareact.rocket;

public class RocketNotFoundException extends RuntimeException {

  public RocketNotFoundException(String id) {
    super("Rocket not found: " + id);
  }
}
