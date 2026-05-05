# Railway Deployment Guide

This project deploys as **two separate Railway services** (one per Spring Boot app) plus a static deploy for the Angular frontend.

## 1. Repository Layout (must match)

```
hotel-booking-system/
├── hotel-auth-service/       ← Railway service #1 (Root Directory)
├── hotel-booking-service/    ← Railway service #2 (Root Directory)
└── hotel-booking-ui/         ← Deploy to Vercel/Netlify (or a third Railway static service)
```

## 2. Railway Setup — Per Service

For BOTH `hotel-auth-service` and `hotel-booking-service`:

| Setting          | Value                                                  |
|------------------|--------------------------------------------------------|
| Root Directory   | `hotel-auth-service` (or `hotel-booking-service`)      |
| Build Command    | `mvn clean package -DskipTests`                        |
| Start Command    | `java -Dserver.port=$PORT -jar target/*.jar`           |
| Healthcheck Path | `/auth/health` (auth) &nbsp; / &nbsp; `/hotels` (booking) |

Railway's Nixpacks auto-detects Java 17 from `system.properties`.
A `nixpacks.toml` and `Procfile` are also included as belt-and-suspenders.

## 3. Required Environment Variables (per Railway service)

| Variable                | Required | Example / Notes |
|-------------------------|----------|-----------------|
| `PORT`                  | auto     | Injected by Railway. Read by `server.port=${PORT:8080}`. |
| `JWT_SECRET`            | **YES**  | Base64-encoded 512-bit secret. **MUST be identical** in both services. |
| `JWT_EXPIRATION_MS`     | optional | Default `86400000` (24h). Auth-service only. |
| `CORS_ALLOWED_ORIGINS`  | **YES**  | Your frontend URL, e.g. `https://hotel-ui.vercel.app`. Comma-separate for multiple. |

### Generate a JWT secret
```bash
openssl rand -base64 64 | tr -d '\n'
```
Set the **same** value on both services.

### Sample env-var matrix
```
# hotel-auth-service
JWT_SECRET=<generated>
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=https://hotel-ui.vercel.app

# hotel-booking-service
JWT_SECRET=<same as above>
CORS_ALLOWED_ORIGINS=https://hotel-ui.vercel.app
```

## 4. Database Notes (H2 in-memory)

- Each service uses its own in-memory H2 (`jdbc:h2:mem:...`).
- `spring.jpa.hibernate.ddl-auto=create-drop` rebuilds schemas on each restart.
- `DataSeeder` re-seeds `admin/admin123` + `user/user123` on every boot of `hotel-auth-service`.
- `HotelDataSeeder` re-seeds 6 hotels on every boot of `hotel-booking-service`.
- Bookings DO NOT persist across restarts — acceptable for a demo. Switch to Railway-Postgres later by:
  1. Adding `org.postgresql:postgresql` to both `pom.xml`s
  2. Replacing `spring.datasource.url` with `${DATABASE_URL}` (Railway auto-provides this when you attach a Postgres plugin)

## 5. Endpoints (post-deploy)

| URL                                                                             | Purpose |
|---------------------------------------------------------------------------------|---------|
| `https://<auth>.up.railway.app/auth/health`                                     | Health check |
| `https://<auth>.up.railway.app/auth/login`                                      | POST `{username, password}` → JWT |
| `https://<booking>.up.railway.app/hotels`                                       | GET all hotels |
| `https://<booking>.up.railway.app/hotels/{id}/availability`                     | GET 7-day availability |
| `https://<booking>.up.railway.app/bookings`                                     | POST booking (USER/ADMIN JWT) |
| `https://<booking>.up.railway.app/admin/bookings`                               | GET all bookings (ADMIN JWT) |

## 6. Frontend (`hotel-booking-ui`) Deployment

1. Update `src/environments/environment.prod.ts` with your two Railway URLs (replace placeholders).
2. Build:
   ```bash
   cd hotel-booking-ui
   yarn install
   yarn build --configuration production
   ```
3. Deploy `dist/hotel-booking-ui/browser` to Vercel/Netlify or a static Railway service.
4. After the frontend has a final URL, update `CORS_ALLOWED_ORIGINS` on both Spring services and redeploy.

## 7. Smoke Test

```bash
AUTH=https://<auth>.up.railway.app
BOOK=https://<booking>.up.railway.app

curl -s $AUTH/auth/health
curl -s -X POST $AUTH/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

curl -s $BOOK/hotels
```

## 8. Why the previous deploy crashed with “Application failed to respond”

1. **Hardcoded `server.port=8081`** — Railway expects you to bind to `$PORT`. Now fixed via `${PORT:8080}`.
2. **Server bound to `localhost`/loopback** — fixed by adding `server.address=0.0.0.0`.
3. **MySQL connection on startup** with no MySQL plugin attached → Hikari pool init failed → app died. Now uses H2 in-memory, which boots without external infra.
4. **Booking service calling `users` table that lives in auth-service's DB** — removed; it now derives `user_id` from the JWT-supplied username.
