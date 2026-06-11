# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

## [0.2.0] - 2026-06-11

### Added

- **Bookings management** — passengers can book seats on confirmed launches and operators can see the manifest:
  - `POST /api/bookings` creates a booking (passenger name, email, phone) with status `CREATED`; duplicate bookings (same launch + email) are rejected with `409 Conflict`.
  - `POST /api/bookings/{id}/cancel` transitions a `CREATED` booking to `CANCELLED`; cancelling an already-cancelled booking returns `409 Conflict`. Records are never deleted.
  - `GET /api/bookings?launchId=…` lists all bookings for a launch (operator manifest view).
  - `GET /api/bookings?email=…` lists all bookings for a passenger (My Bookings view).
  - SPA: **Book this launch** form with required-field and email-format validation, **My bookings** view with cancel action, and passenger manifest on the launch detail.
  - `booking` table with unique constraint on (`launch_id`, `passenger_email`).

### Changed

- Cancelling a launch now cascades: all its `CREATED` bookings transition to `CANCELLED`.
- Invalid state transitions (launch and booking) now return `409 Conflict` instead of `400 Bad Request`.
