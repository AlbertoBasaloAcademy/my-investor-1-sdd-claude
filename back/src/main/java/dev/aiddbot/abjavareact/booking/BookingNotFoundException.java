package dev.aiddbot.abjavareact.booking;

public class BookingNotFoundException extends RuntimeException {

  public BookingNotFoundException(Long id) {
    super("Booking not found: " + id);
  }
}
