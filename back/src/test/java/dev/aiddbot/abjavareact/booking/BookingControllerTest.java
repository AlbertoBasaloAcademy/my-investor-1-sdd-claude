package dev.aiddbot.abjavareact.booking;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BookingController.class)
class BookingControllerTest {

  @Autowired
  private MockMvc mvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private BookingService service;

  private static final BookingResponse RESPONSE =
      new BookingResponse(1L, "L1", "Jane Doe", "jane@example.com", "555-0100", "CREATED");

  @Test
  void createReturns201() throws Exception {
    given(service.createBooking(any())).willReturn(RESPONSE);

    mvc.perform(post("/api/bookings")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new BookingRequest("L1", "Jane Doe", "jane@example.com", "555-0100"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.launchId").value("L1"))
        .andExpect(jsonPath("$.status").value("CREATED"));
  }

  @Test
  void cancelReturns200WithUpdatedBooking() throws Exception {
    BookingResponse cancelled = new BookingResponse(1L, "L1", "Jane Doe", "jane@example.com", "555-0100", "CANCELLED");
    given(service.cancelBooking(1L)).willReturn(cancelled);

    mvc.perform(post("/api/bookings/1/cancel"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("CANCELLED"));
  }

  @Test
  void cancelNotFoundReturns404() throws Exception {
    given(service.cancelBooking(99L)).willThrow(new BookingNotFoundException(99L));

    mvc.perform(post("/api/bookings/99/cancel"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").exists());
  }

  @Test
  void cancelAlreadyCancelledReturns409() throws Exception {
    given(service.cancelBooking(1L)).willThrow(new IllegalStateException("Booking already cancelled"));

    mvc.perform(post("/api/bookings/1/cancel"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.error").value("Booking already cancelled"));
  }

  @Test
  void getByLaunchIdReturns200() throws Exception {
    given(service.getBookingsByLaunch("L1")).willReturn(List.of(RESPONSE));

    mvc.perform(get("/api/bookings").param("launchId", "L1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].launchId").value("L1"));
  }

  @Test
  void getByEmailReturns200() throws Exception {
    given(service.getBookingsByEmail("jane@example.com")).willReturn(List.of(RESPONSE));

    mvc.perform(get("/api/bookings").param("email", "jane@example.com"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].passengerEmail").value("jane@example.com"));
  }
}
