# System architecture — AstroBookings

## Overview

AstroBookings is a fictional space travel booking system. Operators manage a fleet of rockets and schedule launches with seat pricing and occupancy rules. Passengers browse launches and make bookings. Payments and refunds flow through a mock transactional gateway. The system comprises a Spring Boot REST API, a React SPA, and a Playwright e2e suite.

---

## Containers diagram

```mermaid
C4Container
  title AstroBookings Containers

  Person(operator, "Operator")
  Person(passenger, "Passenger")

  Container_Boundary(astrobookings, "AstroBookings") {
    Container(front, "front", "React 19 + TypeScript + Vite", "SPA — manages rockets, launches, and bookings")
    Container(back, "back", "Java 21 + Spring Boot 3.5", "REST API — business logic and data access")
    ContainerDb(db, "db", "SQLite", "Embedded file database — persists all domain data")
  }

  Container(e2e, "e2e", "Playwright", "End-to-end test suite")

  Rel(operator, front, "Manages rockets & launches", "HTTPS")
  Rel(passenger, front, "Browses & books launches", "HTTPS")
  Rel(front, back, "API calls", "HTTP/JSON REST")
  Rel(back, db, "Reads / writes", "JDBC / JPA")
  Rel(e2e, front, "Drives browser", "Playwright")
  Rel(e2e, back, "Calls API directly", "HTTP")
```

### Containers table
| Container | Technology | Responsibility |
|-----------|------------|----------------|
| [front](./../front.arch.md) | React 19, TypeScript, Vite | SPA — rockets, launches, bookings UI |
| [back](./back.arch.md) | Java 21, Spring Boot 3.5, Spring Data JPA | REST API — business logic, data access |
| [db](./../db.arch.md) | SQLite (embedded) | Persistent file-based data store |
| [e2e](./../e2e.arch.md) | Playwright | End-to-end browser test suite |

---

## Entity-Relationship diagram

> Canonical, system-wide entity model. Specs reference a feature subset; container docs add physical schemas.

```mermaid
erDiagram
    Rocket ||--o{ Launch : "used in"
    Launch ||--o{ Booking : "has"
    User ||--o{ Booking : "makes"
    Booking ||--o| Payment : "generates"
    Launch ||--o| Payment : "triggers refund via"
```

---

> last updated: 2026-06-09
