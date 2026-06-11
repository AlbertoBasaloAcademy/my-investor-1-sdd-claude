package dev.aiddbot.abjavareact.booking;

public record BookingResponse(
    Long id,
    String launchId,
    String passengerName,
    String passengerEmail,
    String passengerPhone,
    String status
) {

  static BookingResponse from(Booking booking) {
    return new BookingResponse(
        booking.getId(),
        booking.getLaunch().getId(),
        booking.getPassengerName(),
        booking.getPassengerEmail(),
        booking.getPassengerPhone(),
        booking.getStatus()
    );
  }
}
