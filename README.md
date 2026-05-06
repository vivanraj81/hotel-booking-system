# 🏨 Hotel Booking Microservices System

A full-stack hotel booking platform with role-based access (**ADMIN / USER**), built using Spring Boot microservices and Angular. Supports secure JWT authentication, real-time availability, and a 7-day booking flow.

---

## 🌐 Live Demo

* **Frontend (Vercel):**
  https://hotel-booking-system-1aniuazew-vivan-rajs-projects.vercel.app

* **Auth Service (Railway):**
  https://hotel-booking-system-production-dc9e.up.railway.app

* **Booking Service (Railway):**
  https://exciting-enthusiasm-production-cbb9.up.railway.app

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
* Calendar with **clickable date selection**
* Disabled booked dates in UI
* Real-time availability validation before booking
* Booking confirmation message

---

### 👨‍💼 Admin

* View all bookings
* Dashboard metrics:

  * Total bookings
  * Total revenue
  * Unique guests
* Pagination and sorting support

---

## 🔐 Security

* JWT-based authentication (shared secret across services)
* Role-based authorization (**ADMIN / USER**)
* Password hashing with BCrypt
* Protected endpoints via Spring Security
* Token expiry handling

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

```
UNIQUE (hotel_id, reserved_date)
```

→ Prevents double booking

---

## 🔌 REST APIs

### 🔐 Auth Service

* `POST /auth/login` → returns JWT + role
* `GET /auth/health` → health check

---

### 🏨 Booking Service

* `GET /hotels` → list hotels
* `GET /hotels/{id}/availability` → 7-day availability
* `POST /bookings` → create booking (**JWT required**)
* `GET /admin/bookings` → admin-only bookings

---

## ⚠️ Error Handling

| Scenario                     | Status |
| ---------------------------- | ------ |
| Invalid request              | 400    |
| Hotel not found              | 404    |
| Duplicate booking            | 409    |
| Unauthorized / invalid token | 403    |
| Server error                 | 500    |

**UI Messages:**

* ✅ Success → *"Your booking for the Hotel <NAME> is successful"*
* ❌ Failure → Context-specific messages (e.g., booked date already selected)

---

## ▶️ Setup Instructions

### 1. Database Setup

```bash
mysql -u root -e "
CREATE DATABASE hotel_db;
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
* Datepicker selection working correctly
* Booked dates disabled in UI
* Real-time availability validation
* Duplicate booking prevented (409)
* Admin access restriction enforced (403 for USER)
* Pagination + sorting working

---

## 📁 Project Structure

```
hotel-auth-service      → authentication + JWT  
hotel-booking-service   → business logic + bookings  
hotel-booking-ui        → Angular frontend  
```

---

## 🔮 Future Improvements

* Token refresh mechanism
* Booking cancellation flow
* Email notifications
* Hotel images & descriptions
* Revenue analytics charts

---

## 📌 Notes

* Fully deployed system with working frontend + backend
* Microservices communicate via REST APIs
* Production-ready authentication & authorization
