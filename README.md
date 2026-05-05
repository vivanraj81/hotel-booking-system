# Hotel Booking Microservices System

A full-stack hotel booking platform with role-based access (ADMIN / USER), built using Spring Boot microservices and Angular.
Supports secure JWT authentication, real-time availability, and a 7-day booking flow.

---

## 🧱 Tech Stack

| Layer    | Technology                            |
| -------- | ------------------------------------- |
| Backend  | Spring Boot 3.2, Spring Security, JPA |
| Frontend | Angular 17, Angular Material          |
| Database | MariaDB / MySQL                       |
| Auth     | JWT (HS512) + BCrypt                  |

---

## ⚙️ Architecture Overview

| Component             | Description                               | Port |
| --------------------- | ----------------------------------------- | ---- |
| hotel-auth-service    | Handles authentication and JWT generation | 8081 |
| hotel-booking-service | Manages hotels, availability, bookings    | 8082 |
| hotel-booking-ui      | Angular frontend application              | 4200 |
| Database              | MariaDB / MySQL (hotel_db)                | 3306 |

---

## 🚀 Features

### 👤 User

* Login with JWT authentication
* View hotels with 7-day availability
* Disabled booked dates in calendar
* Real-time availability validation before booking
* Book hotel with confirmation message

### 👨‍💼 Admin

* View all bookings
* Dashboard metrics:

  * Total bookings
  * Total revenue
  * Unique guests
* Pagination and sorting support

---

## 🔐 Security

* JWT-based authentication (shared secret between services)
* Role-based authorization (ADMIN / USER)
* Password hashing with BCrypt
* Protected endpoints with Spring Security
* Token expiry handling with automatic logout

---

## 🗄️ Database Schema

### Users

* id (PK)
* username (unique)
* password (BCrypt)
* role (ADMIN / USER)

### Hotels

* id (PK)
* name
* price

### Bookings

* id (PK)
* hotel_id (FK)
* user_id (FK)
* username
* reserved_date
* amount_paid

**Constraint:**

* UNIQUE (hotel_id, reserved_date) → prevents double booking

---

## 🔌 REST APIs

### Auth Service (:8081)

* `POST /auth/login` → returns JWT + role
* `GET /auth/health` → health check

---

### Booking Service (:8082)

* `GET /hotels` → list hotels
* `GET /hotels/{id}/availability` → 7-day availability
* `POST /bookings` → create booking (USER / ADMIN)
* `GET /admin/bookings` → admin-only booking list

---

## ⚠️ Error Handling

| Scenario                     | Status |
| ---------------------------- | ------ |
| Invalid request              | 400    |
| Hotel not found              | 404    |
| Duplicate booking            | 409    |
| Unauthorized / invalid token | 403    |
| Server error                 | 500    |

UI shows:

* Success → `"Your booking for the Hotel <NAME> is successful"`
* Failure → `"Please try again!!"`

---

## ▶️ Setup Instructions

### 1. Database Setup

```bash
mysql -u root -e "CREATE DATABASE hotel_db;
CREATE USER 'hoteluser'@'localhost' IDENTIFIED BY 'hotelpass';
GRANT ALL PRIVILEGES ON hotel_db.* TO 'hoteluser'@'localhost';
FLUSH PRIVILEGES;"
```

---

### 2. Run Auth Service

```bash
cd hotel-auth-service
mvn clean package -DskipTests
java -jar target/hotel-auth-service-1.0.0.jar
```

---

### 3. Run Booking Service

```bash
cd hotel-booking-service
mvn clean package -DskipTests
java -jar target/hotel-booking-service-1.0.0.jar
```

---

### 4. Run Frontend

```bash
cd hotel-booking-ui
yarn install
yarn start
```

Open: http://localhost:4200

---

## 🔑 Default Credentials

| Role  | Username | Password |
| ----- | -------- | -------- |
| ADMIN | admin    | admin123 |
| USER  | user     | user123  |

---

## 🧪 Verified Scenarios

* Login with role-based redirect
* Booking success message displayed correctly
* Booked dates disabled in UI
* Real-time availability validation prevents stale booking
* Duplicate booking blocked (409)
* Admin access restricted (403 for USER)
* Pagination + sorting works in admin dashboard

---

## 📁 Project Structure

* `hotel-auth-service` → authentication + JWT
* `hotel-booking-service` → business logic + bookings
* `hotel-booking-ui` → Angular frontend

---

## 🔮 Future Improvements

* Token refresh mechanism
* Booking cancellation flow
* Email notifications
* Hotel images and descriptions
* Revenue analytics charts

---
