package dev.aiddbot.abjavareact.launch;

import dev.aiddbot.abjavareact.rocket.Rocket;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "launch")
public class Launch {

  public static final String STATUS_CREATED = "created";
  public static final String STATUS_CONFIRMED = "confirmed";
  public static final String STATUS_COMPLETED = "completed";
  public static final String STATUS_CANCELLED = "cancelled";

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "rocket_id", nullable = false)
  private Rocket rocket;

  @Column(name = "scheduled_at", nullable = false)
  private LocalDateTime scheduledAt;

  @Column(name = "price_per_ticket", nullable = false)
  private BigDecimal pricePerTicket;

  @Column(name = "minimum_occupancy", nullable = false)
  private int minimumOccupancy;

  @Column(nullable = false)
  private String status;

  protected Launch() {
  }

  public Launch(Rocket rocket, LocalDateTime scheduledAt, BigDecimal pricePerTicket, int minimumOccupancy) {
    this.rocket = rocket;
    this.scheduledAt = scheduledAt;
    this.pricePerTicket = pricePerTicket;
    this.minimumOccupancy = minimumOccupancy;
    this.status = STATUS_CREATED;
  }

  public String getId() {
    return id;
  }

  public Rocket getRocket() {
    return rocket;
  }

  public void setRocket(Rocket rocket) {
    this.rocket = rocket;
  }

  public LocalDateTime getScheduledAt() {
    return scheduledAt;
  }

  public void setScheduledAt(LocalDateTime scheduledAt) {
    this.scheduledAt = scheduledAt;
  }

  public BigDecimal getPricePerTicket() {
    return pricePerTicket;
  }

  public void setPricePerTicket(BigDecimal pricePerTicket) {
    this.pricePerTicket = pricePerTicket;
  }

  public int getMinimumOccupancy() {
    return minimumOccupancy;
  }

  public void setMinimumOccupancy(int minimumOccupancy) {
    this.minimumOccupancy = minimumOccupancy;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
