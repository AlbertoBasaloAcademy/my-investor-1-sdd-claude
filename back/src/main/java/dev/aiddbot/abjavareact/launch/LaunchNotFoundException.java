package dev.aiddbot.abjavareact.launch;

public class LaunchNotFoundException extends RuntimeException {

  public LaunchNotFoundException(String id) {
    super("Launch not found: " + id);
  }
}
