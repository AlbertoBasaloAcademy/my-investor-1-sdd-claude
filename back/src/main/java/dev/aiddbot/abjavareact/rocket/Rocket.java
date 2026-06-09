package dev.aiddbot.abjavareact.rocket;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "rocket")
public class Rocket {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private int capacity;

  @Column(nullable = false, name = "range_of_action")
  private String range;

  protected Rocket() {
  }

  public Rocket(String name, int capacity, String range) {
    this.name = name;
    this.capacity = capacity;
    this.range = range;
  }

  public String getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public int getCapacity() {
    return capacity;
  }

  public void setCapacity(int capacity) {
    this.capacity = capacity;
  }

  public String getRange() {
    return range;
  }

  public void setRange(String range) {
    this.range = range;
  }
}
