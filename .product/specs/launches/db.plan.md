---
plan-type: spec
container: db
---
# spec - launches - db

## Specification

The database must persist all launch data reliably.

- A `launches` table stores each launch with its rocket reference, time, pricing, occupancy threshold, and status.
- Referential integrity is enforced between launches and rockets.

**Context**: [spec.md](./spec.md)
**Architecture**: [back.arch.md](../../arch/back.arch.md)

### Data model

```sql
CREATE TABLE launch (
  id               VARCHAR PRIMARY KEY,
  rocket_id        VARCHAR NOT NULL REFERENCES rocket(id),
  scheduled_at     DATETIME NOT NULL,
  price_per_ticket DECIMAL  NOT NULL CHECK (price_per_ticket > 0),
  minimum_occupancy INT     NOT NULL CHECK (minimum_occupancy > 0),
  status           VARCHAR  NOT NULL DEFAULT 'created'
                            CHECK (status IN ('created','confirmed','completed','cancelled'))
);
```

## Implementation Steps

### Step 1: Verify schema file
Confirm the DDL source that Spring Boot uses to create or migrate the `launch` table.
- Paths:
    - `back/src/main/resources/schema.sql`
    - `back/src/main/resources/application.properties`
- [ ] If `spring.sql.init.mode=always` (or `embedded`) is set, add the `CREATE TABLE IF NOT EXISTS launch (...)` DDL to `schema.sql` using the columns and constraints above.
- [ ] If Hibernate `ddl-auto=update` is used instead, confirm the `Launch` JPA entity maps all columns correctly and no manual DDL is needed — skip `schema.sql` changes.

### Step 2: Referential integrity
Ensure the FK from `launch.rocket_id` to `rocket.id` is enforced at the database level.
- Paths:
    - `back/src/main/resources/schema.sql`
    - `back/src/main/java/dev/aiddbot/abjavareact/launch/Launch.java`
- [ ] In `schema.sql` (if used): declare `FOREIGN KEY (rocket_id) REFERENCES rocket(id)`.
- [ ] In the `Launch` entity: annotate with `@Column(name = "rocket_id", nullable = false)` so JPA does not auto-drop the constraint.
- [ ] Enable SQLite foreign-key enforcement if not already set: add `PRAGMA foreign_keys = ON;` to `schema.sql` or via a `DataSourceInitializer` bean.

### Step 3: Verify launch table is created on startup
Confirm the table and FK exist after the application boots.
- Paths:
    - `back/src/main/resources/`
- [ ] Start the backend (`mvnw.cmd spring-boot:run`) and inspect the SQLite file with any SQLite browser or `sqlite3` CLI to confirm the `launch` table and FK constraint exist.
