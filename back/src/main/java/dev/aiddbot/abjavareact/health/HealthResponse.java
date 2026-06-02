package dev.aiddbot.abjavareact.health;

public record HealthResponse(String status, String database, Uptime uptime, String timestamp) {

  public record Uptime(long seconds, String since) {
  }
}
