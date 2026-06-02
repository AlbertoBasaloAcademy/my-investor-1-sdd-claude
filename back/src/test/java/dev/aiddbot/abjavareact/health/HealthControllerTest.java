package dev.aiddbot.abjavareact.health;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.aiddbot.abjavareact.health.HealthResponse.Uptime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(HealthController.class)
class HealthControllerTest {

  @Autowired
  private MockMvc mvc;

  @MockitoBean
  private HealthService service;

  @Test
  void returnsOkWhenHealthy() throws Exception {
    given(service.check())
        .willReturn(new HealthResponse("UP", "UP", new Uptime(3725L, "2026-05-29T10:00:00Z"), "2026-05-29T11:02:05Z"));

    mvc.perform(get("/api/health"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("UP"))
        .andExpect(jsonPath("$.database").value("UP"))
        .andExpect(jsonPath("$.uptime.seconds").value(3725))
        .andExpect(jsonPath("$.uptime.since").value("2026-05-29T10:00:00Z"))
        .andExpect(jsonPath("$.timestamp").value("2026-05-29T11:02:05Z"));
  }

  @Test
  void returnsServiceUnavailableWhenDown() throws Exception {
    given(service.check())
        .willReturn(new HealthResponse("DOWN", "DOWN", new Uptime(0L, "2026-05-29T10:00:00Z"), "2026-05-29T11:02:05Z"));

    mvc.perform(get("/api/health"))
        .andExpect(status().isServiceUnavailable())
        .andExpect(jsonPath("$.status").value("DOWN"))
        .andExpect(jsonPath("$.database").value("DOWN"));
  }
}
