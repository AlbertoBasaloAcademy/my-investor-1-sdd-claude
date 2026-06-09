package dev.aiddbot.abjavareact.rocket;

public record RocketResponse(String id, String name, int capacity, String range) {

  static RocketResponse from(Rocket rocket) {
    return new RocketResponse(rocket.getId(), rocket.getName(), rocket.getCapacity(), rocket.getRange());
  }
}
