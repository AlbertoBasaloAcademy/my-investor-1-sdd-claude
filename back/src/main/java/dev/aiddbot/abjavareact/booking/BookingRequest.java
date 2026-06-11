package dev.aiddbot.abjavareact.booking;

public record BookingRequest(
    String launchId,
    String passengerName,
    String passengerEmail,
    String passengerPhone
) {}
