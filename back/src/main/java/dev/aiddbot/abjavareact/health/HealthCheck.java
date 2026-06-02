package dev.aiddbot.abjavareact.health;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "health_check")
public class HealthCheck {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String status;

  @Column(name = "database_status", nullable = false)
  private String databaseStatus;

  @Column(name = "uptime_seconds", nullable = false)
  private long uptimeSeconds;

  @Column(name = "checked_at", nullable = false)
  private String checkedAt;

  protected HealthCheck() {
  }

  public HealthCheck(String status, String databaseStatus, long uptimeSeconds, String checkedAt) {
    this.status = status;
    this.databaseStatus = databaseStatus;
    this.uptimeSeconds = uptimeSeconds;
    this.checkedAt = checkedAt;
  }

  public Long getId() {
    return id;
  }

  public String getStatus() {
    return status;
  }

  public String getDatabaseStatus() {
    return databaseStatus;
  }

  public long getUptimeSeconds() {
    return uptimeSeconds;
  }

  public String getCheckedAt() {
    return checkedAt;
  }
}
