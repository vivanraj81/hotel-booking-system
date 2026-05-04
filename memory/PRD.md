# Hotel Booking System — PRD

## Original Problem Statement
Build a complete full-stack hotel booking system consisting of two separate applications:
1. **Authentication Service** — Spring Boot, Java, Spring Security, JWT, MySQL, JPA, Maven
2. **Hotel Booking Web App** — Angular (latest), TypeScript, Angular Material, JWT storage

Roles: ADMIN, USER. Users browse hotels, see a 7-day calendar (with disabled booked dates) and book. Admins see a table of all bookings.

## User Personas
- **End User** — books a hotel for a specific date in the next 7 days.
- **Admin** — monitors all bookings (hotel, date, user, amount paid).

## Architecture Decisions
- Two Spring Boot services (auth + booking) sharing the same `hotel_db` and same JWT secret.
- JWT (HS512) carries `sub` (username) + `role` claim.
- Frontend is Angular 17 standalone-component-based with `provideRouter`, lazy-loaded routes, signal-based state, and Angular Material 17.
- Angular Material Datepicker (Moment adapter) drives the 7-day window with `matDatepickerFilter` disabling booked dates.
- DB-level `UNIQUE(hotel_id, reserved_date)` guarantees no double-booking even under race conditions.

## Implemented (May 2026)
**Backend — `hotel-auth-service`**
- `POST /auth/login` (BCrypt + JWT)
- Auto-seeded users: `admin/admin123`, `user/user123`
- Layered: controller / service / repository / entity / security / dto / config / exception

**Backend — `hotel-booking-service`**
- `GET /hotels` — list all hotels (public)
- `GET /hotels/{id}/availability` — next 7 days availability + booked dates (public)
- `POST /bookings` — JWT-protected (USER or ADMIN)
- `GET /admin/bookings` — JWT-protected (ADMIN only)
- 6 sample hotels auto-seeded

**Frontend — `hotel-booking-ui`**
- Login page (Material card + form, demo credentials shown)
- User dashboard: hotel grid, Material Datepicker, disabled booked dates, "Book It"
- Admin dashboard: stats cards + Material Table of bookings
- HTTP interceptors (auth header + 401/403 auto-logout)
- Route guards (`authGuard`, `roleGuard`)

## Verified Flows
- Admin login → `/admin` route, stats + bookings table render.
- User login → `/hotels` route, hotel cards render, availability fetched per card.
- Booking flow: select date → "Your booking for the Hotel <NAME> is successful".
- Logout clears localStorage and redirects to `/login`.

## Backlog / Next Iteration
**P0**
- _None — all primary acceptance criteria met._

**P1**
- Hotel image uploads / cover photos per hotel.
- Pagination + search on the admin bookings table.
- Cancel-booking flow (USER) and revenue chart (ADMIN).

**P2**
- Email confirmation on successful booking.
- Multi-night booking ranges instead of single-day.
- Refresh-token rotation.

## Running Locally
See `/app/README.md` for setup steps.
