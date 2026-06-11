package dev.aiddbot.abjavareact.booking;

import dev.aiddbot.abjavareact.launch.Launch;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "booking", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"launch_id", "passenger_email"})
})
public class Booking {

  public static final String STATUS_CREATED = "CREATED";
  public static final String STATUS_CANCELLED = "CANCELLED";

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "launch_id", nullable = false)
  private Launch launch;

  @Column(name = "passenger_name", nullable = false)
  private String passengerName;

  @Column(name = "passenger_email", nullable = false)
  private String passengerEmail;

  @Column(name = "passenger_phone", nullable = false)
  private String passengerPhone;

  @Column(nullable = false)
  private String status = STATUS_CREATED;

  protected Booking() {
  }

  public Booking(Launch launch, String passengerName, String passengerEmail, String passengerPhone) {
    this.launch = launch;
    this.passengerName = passengerName;
    this.passengerEmail = passengerEmail;
    this.passengerPhone = passengerPhone;
  }

  public Long getId() {
    return id;
  }

  public Launch getLaunch() {
    return launch;
  }

  public String getPassengerName() {
    return passengerName;
  }

  public String getPassengerEmail() {
    return passengerEmail;
  }

  public String getPassengerPhone() {
    return passengerPhone;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
