package dev.aiddbot.abjavareact.booking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

import dev.aiddbot.abjavareact.launch.Launch;
import dev.aiddbot.abjavareact.launch.LaunchRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

  @Mock
  private BookingRepository repository;

  @Mock
  private LaunchRepository launchRepository;

  @InjectMocks
  private BookingService service;

  private static final BookingRequest REQUEST = new BookingRequest(
      "L1", "Jane Doe", "jane@example.com", "555-0100");

  @Test
  void createBookingHappyPath() {
    given(repository.existsByLaunchIdAndPassengerEmail("L1", "jane@example.com")).willReturn(false);
    Launch launch = launchWithId("L1");
    given(launchRepository.findById("L1")).willReturn(Optional.of(launch));
    Booking saved = bookingWithId(1L, launch, "Jane Doe", "jane@example.com", "555-0100", "CREATED");
    given(repository.save(any(Booking.class))).willReturn(saved);

    BookingResponse response = service.createBooking(REQUEST);

    assertThat(response.id()).isEqualTo(1L);
    assertThat(response.launchId()).isEqualTo("L1");
    assertThat(response.status()).isEqualTo("CREATED");
  }

  @Test
  void createBookingDuplicateThrowsIllegalState() {
    given(repository.existsByLaunchIdAndPassengerEmail("L1", "jane@example.com")).willReturn(true);

    assertThatThrownBy(() -> service.createBooking(REQUEST))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("Duplicate");
  }

  @Test
  void cancelBookingHappyPath() {
    Launch launch = launchWithId("L1");
    Booking booking = bookingWithId(1L, launch, "Jane Doe", "jane@example.com", "555-0100", "CREATED");
    given(repository.findById(1L)).willReturn(Optional.of(booking));
    Booking cancelled = bookingWithId(1L, launch, "Jane Doe", "jane@example.com", "555-0100", "CANCELLED");
    given(repository.save(booking)).willReturn(cancelled);

    BookingResponse response = service.cancelBooking(1L);

    assertThat(response.status()).isEqualTo("CANCELLED");
  }

  @Test
  void cancelBookingAlreadyCancelledThrows() {
    Launch launch = launchWithId("L1");
    Booking booking = bookingWithId(1L, launch, "Jane Doe", "jane@example.com", "555-0100", "CANCELLED");
    given(repository.findById(1L)).willReturn(Optional.of(booking));

    assertThatThrownBy(() -> service.cancelBooking(1L))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("already cancelled");
  }

  @Test
  void cancelBookingNotFoundThrows() {
    given(repository.findById(99L)).willReturn(Optional.empty());

    assertThatThrownBy(() -> service.cancelBooking(99L))
        .isInstanceOf(BookingNotFoundException.class);
  }

  @Test
  void getBookingsByLaunchReturnsList() {
    Launch launch = launchWithId("L1");
    given(repository.findByLaunchId("L1")).willReturn(List.of(
        bookingWithId(1L, launch, "Jane", "jane@example.com", "555-0100", "CREATED"),
        bookingWithId(2L, launch, "John", "john@example.com", "555-0200", "CREATED")
    ));

    List<BookingResponse> result = service.getBookingsByLaunch("L1");

    assertThat(result).hasSize(2);
    assertThat(result.get(0).launchId()).isEqualTo("L1");
  }

  @Test
  void getBookingsByEmailReturnsList() {
    Launch launch = launchWithId("L1");
    given(repository.findByPassengerEmail("jane@example.com")).willReturn(List.of(
        bookingWithId(1L, launch, "Jane", "jane@example.com", "555-0100", "CREATED")
    ));

    List<BookingResponse> result = service.getBookingsByEmail("jane@example.com");

    assertThat(result).hasSize(1);
    assertThat(result.get(0).passengerEmail()).isEqualTo("jane@example.com");
  }

  private Launch launchWithId(String id) {
    Launch l = new Launch(null, null, null, 1);
    try {
      var field = Launch.class.getDeclaredField("id");
      field.setAccessible(true);
      field.set(l, id);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    return l;
  }

  private Booking bookingWithId(Long id, Launch launch, String name, String email, String phone, String status) {
    Booking b = new Booking(launch, name, email, phone);
    b.setStatus(status);
    try {
      var field = Booking.class.getDeclaredField("id");
      field.setAccessible(true);
      field.set(b, id);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    return b;
  }
}
