# Hotel Booking System

A complete full-stack hotel booking platform with role-based access (ADMIN / USER), JWT authentication, and a 7-day calendar booking flow.

## Architecture

| Component | Tech | Port |
|-----------|------|------|
| `hotel-auth-service` | Spring Boot 3.2 + Spring Security + JWT + MySQL | 8081 |
| `hotel-booking-service` | Spring Boot 3.2 + Spring Security + JPA + MySQL | 8082 |
| `hotel-booking-ui` | Angular 17 + Angular Material 17 | 4200 |
| Database | MariaDB / MySQL (`hotel_db`) | 3306 |

## Database Schema

### `users`
| Column   | Type                  |
|----------|-----------------------|
| id       | BIGINT, PK, AUTO      |
| username | VARCHAR, UNIQUE       |
| password | VARCHAR (BCrypt hash) |
| role     | ENUM(`ADMIN`,`USER`)  |

### `hotels`
| Column | Type             |
|--------|------------------|
| id     | BIGINT, PK, AUTO |
| name   | VARCHAR          |
| price  | DOUBLE           |

### `bookings`
| Column        | Type                                                     |
|---------------|----------------------------------------------------------|
| id            | BIGINT, PK, AUTO                                         |
| hotel_id      | BIGINT, FK → `hotels.id`                                 |
| user_id       | BIGINT, FK → `users.id`                                  |
| username      | VARCHAR                                                  |
| reserved_date | DATE                                                     |
| amount_paid   | DOUBLE                                                   |
| **UNIQUE** `(hotel_id, reserved_date)` — prevents double booking |

## Sample Data (auto-seeded)
- Users: `admin/admin123` (ADMIN), `user/user123` (USER)
- 6 hotels (Grand Marquis Resort, The Velvet Orchid, Skyline Suites, etc.)

## REST Endpoints

### Auth Service (`:8081`)
| Method | Path             | Auth   | Description |
|--------|------------------|--------|-------------|
| POST   | `/auth/login`    | None   | Returns JWT + role |
| GET    | `/auth/health`   | None   | Health check |

**Request** `POST /auth/login`:
```json
{ "username": "admin", "password": "admin123" }
```
**Response**:
```json
{ "token": "eyJ...", "role": "ADMIN", "username": "admin" }
```

### Booking Service (`:8082`)
| Method | Path                          | Auth         | Description |
|--------|-------------------------------|--------------|-------------|
| GET    | `/hotels`                     | Public       | List all hotels |
| GET    | `/hotels/{id}/availability`   | Public       | Available + booked dates for next 7 days |
| POST   | `/bookings`                   | USER / ADMIN | Create booking |
| GET    | `/admin/bookings`             | ADMIN only   | List all bookings |

**Booking request** `POST /bookings`:
```json
{ "hotelId": 1, "date": "2026-05-08" }
```
**Response on success**:
```json
{
  "success": true,
  "message": "Your booking for the Hotel Grand Marquis Resort is successful",
  ...
}
```

## How to Run

### Prerequisites
- Java 17+, Maven 3.8+
- Node.js 18+, Yarn
- MariaDB / MySQL 10.x+

### 1. Start MySQL & create the database
```bash
mysql -u root -e "CREATE DATABASE hotel_db; \
  CREATE USER 'hoteluser'@'localhost' IDENTIFIED BY 'hotelpass'; \
  GRANT ALL PRIVILEGES ON hotel_db.* TO 'hoteluser'@'localhost'; \
  FLUSH PRIVILEGES;"
```

### 2. Run Auth Service (port 8081)
```bash
cd hotel-auth-service
mvn clean package -DskipTests
java -jar target/hotel-auth-service-1.0.0.jar
```

### 3. Run Booking Service (port 8082)
```bash
cd hotel-booking-service
mvn clean package -DskipTests
java -jar target/hotel-booking-service-1.0.0.jar
```

### 4. Run the Angular UI (port 4200)
```bash
cd hotel-booking-ui
yarn install
yarn start
```

Open http://localhost:4200 → log in with the seeded credentials above.

## Project Structure

```
/app
├── hotel-auth-service          (Spring Boot — JWT auth)
│   └── src/main/java/com/hotel/auth/
│       ├── controller/         AuthController
│       ├── service/            AuthService
│       ├── repository/         UserRepository
│       ├── entity/             User, Role
│       ├── dto/                LoginRequest, LoginResponse, ErrorResponse
│       ├── security/           JwtUtil
│       ├── config/             SecurityConfig, DataSeeder
│       └── exception/          GlobalExceptionHandler
├── hotel-booking-service       (Spring Boot — hotels + bookings)
│   └── src/main/java/com/hotel/booking/
│       ├── controller/         HotelController, BookingController, AdminController
│       ├── service/            HotelService, BookingService
│       ├── repository/         HotelRepository, BookingRepository, UserLookupRepository
│       ├── entity/             Hotel, Booking
│       ├── dto/                HotelDto, AvailabilityResponse, BookingRequest, BookingResponse
│       ├── security/           JwtUtil, JwtAuthenticationFilter
│       ├── config/             SecurityConfig, HotelDataSeeder
│       └── exception/          GlobalExceptionHandler
└── hotel-booking-ui            (Angular 17 + Material)
    └── src/app/
        ├── core/
        │   ├── services/       AuthService, HotelService
        │   ├── guards/         authGuard, roleGuard
        │   ├── interceptors/   authInterceptor, errorInterceptor
        │   └── models/         api.models.ts
        └── features/
            ├── login/          LoginComponent
            ├── user-dashboard/ UserDashboardComponent (hotels + 7-day datepicker)
            └── admin-dashboard/ AdminDashboardComponent (bookings table + stats)
```

## Bonus Features Implemented
- BCrypt password hashing
- Stateless JWT (HS512) shared between both Spring Boot services
- Role-based Angular Route Guards (`authGuard` + `roleGuard(['ADMIN'])`)
- HTTP interceptors for JWT injection and 401/403 auto-logout
- Booked dates disabled in Material datepicker via `matDatepickerFilter`
- Unique constraint `(hotel_id, reserved_date)` prevents double-booking at the DB level
- Centralised `GlobalExceptionHandler` in both services
- Admin Dashboard with summary stats (total bookings, revenue, unique guests)
