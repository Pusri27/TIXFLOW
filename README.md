# 🎟️ TIXFLOW — Enterprise Real-Time Concert Ticketing & Gatekeeper Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20DB-blueviolet.svg)](https://neon.tech/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-red.svg)](https://upstash.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Sandbox-indigo.svg)](https://stripe.com/)
[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud-Run-4285F4.svg)](https://cloud.google.com/run)

**TIXFLOW** is a high-concurrency, enterprise-grade event reservation and gatekeeper management system. Designed to handle high-traffic ticket rushes without race conditions, TIXFLOW features atomic seat locking, official Stripe Sandbox Checkout integration, dynamic anti-screenshot QR codes, Cloudinary-hosted PDF e-tickets, peer-to-peer pass transfers, and live gatekeeper entrance scanning.

---

## 🌐 Production Live Demos

- **Frontend Web Application**: [https://tixflow-frontend-295200560470.asia-southeast1.run.app](https://tixflow-frontend-295200560470.asia-southeast1.run.app)
- **Backend API Engine**: [https://tixflow-backend-295200560470.asia-southeast1.run.app](https://tixflow-backend-295200560470.asia-southeast1.run.app)

---

## ⚡ Key Features & Technical Highlights

### 1. High-Concurrency & Race-Condition Safety (Double Locking Strategy)
- **Redis Distributed Atomic Lock**: Prevents multiple users from reserving the exact same seat simultaneously during high-demand concert ticket drops.
- **JPA Pessimistic Write Locking (`SELECT FOR UPDATE`)**: Guarantees transactional ACID data integrity at the database layer.
- **10-Minute Lock TTL & UTC Timer**: Reserves selected seats for 10 minutes with an active countdown. Unpaid bookings automatically expire and release seats back to the pool.

### 2. Official Stripe Hosted Checkout Integration (`checkout.stripe.com`)
- **Stripe Sandbox API**: Integrated via `com.stripe:stripe-java`. Generates live hosted checkout links on `checkout.stripe.com`.
- **Multi-Card Test Network**: Supports testing successful payments (Visa, Mastercard, Amex), 3D Secure OTP authentication popups, and bank declination scenarios.
- **Auto-Fulfillment**: Upon successful payment, webhook/redirect handlers automatically confirm the booking, mark seats as `BOOKED`, generate PDF passes, and upload them to the cloud.

### 3. Dynamic Anti-Screenshot QR & Cloud PDF E-Tickets
- **Anti-Fraud Dynamic QR Codes**: Dynamic QR codes update automatically every 30 seconds to prevent ticket duplication or fraudulent screenshot sharing.
- **Cloudinary-Hosted PDF Passes**: Official e-tickets are generated server-side using the iText PDF Engine and uploaded to Cloudinary for instant downloading.

### 4. Peer-to-Peer (P2P) Ticket Pass Transfer
- **Seamless Ownership Transfer**: Ticket holders can transfer active passes directly to another registered user by email address.
- **Instant Wallet Update**: Transferred passes immediately vanish from the sender's wallet and appear in the recipient's wallet with updated ownership metadata.

### 5. Gatekeeper Venue Entrance Scanner
- **Real-Time Check-In Verification**: Organizers/Gatekeepers can scan ticket QR codes at venue entrance gates.
- **State Enforcement**: Scanned tickets automatically gain a green **`CHECKED IN AT VENUE GATE`** badge and are locked to prevent further P2P transfers.

---

## 🏗️ Tech Stack & Infrastructure

- **Backend Framework**: Java 11 / Spring Boot 2.7, Spring Security (JWT Authentication), Spring Data JPA.
- **Database & Cache**: Neon Serverless PostgreSQL, Upstash Redis.
- **Cloud Storage & Utilities**: Cloudinary Java SDK, iText PDF Engine, ZXing QR Generator, Stripe Java SDK.
- **Frontend App**: React 18, Vite, Tailwind CSS v4, Lucide Icons, Axios.
- **Cloud Hosting & DevOps**: Google Cloud Run, Google Artifact Registry, Google Cloud Build, Docker, NGINX.

---

## 📁 Repository Structure

```
TIXFLOW/
├── backend/                  # Spring Boot Backend REST API
│   ├── src/main/java/com/pusri/ticketing/
│   │   ├── config/           # Security, Cors, Redis, Cloudinary Config
│   │   ├── controller/       # Auth, Event, Booking, Ticket, Organizer Controllers
│   │   ├── dto/              # Request DTOs & Response Records
│   │   ├── entity/           # JPA Entities (User, Event, Seat, Booking, Ticket)
│   │   ├── repository/       # Data Repositories & Pessimistic Locks
│   │   ├── security/         # JWT Authentication Filters
│   │   ├── service/          # Core Business & Concurrency Locking Logic
│   │   └── util/             # PdfTicketGenerator, QrCodeGenerator, JwtUtil
│   ├── src/main/resources/
│   │   └── application.yml   # Application environment configuration
│   └── pom.xml               # Maven Build Manifest
├── frontend/                 # React + Vite Client
│   ├── src/
│   │   ├── components/       # SeatMap, Navbar, Toast
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── pages/            # EventList, EventDetail, Checkout, MyTickets, Dashboard
│   │   └── services/         # Axios API Client Modules
│   └── vite.config.js        # Vite Build Configuration
├── Dockerfile                # Docker Build Files
└── README.md
```

---

## 💳 Stripe Sandbox Test Cards

When redirected to `checkout.stripe.com`, use any of the following official test cards:

| Card Brand / Scenario | Card Number | Expiry Date | CVC | Expected Result |
|---|---|---|---|---|
| **Visa (Standard)** | `4242 4242 4242 4242` | Future Date (e.g. `12/28`) | `123` | **SUCCESS** |
| **Mastercard** | `5555 5555 5555 4444` | `12/28` | `123` | **SUCCESS** |
| **American Express** | `3782 822463 10005` | `12/28` | `1234` | **SUCCESS** |
| **3D Secure OTP** | `4000 0000 0000 3020` | `12/28` | `123` | **OTP Popup Verification** |
| **Card Declined** | `4000 0000 0000 0002` | `12/28` | `123` | **DECLINED BY BANK** |

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Java 11 Development Kit (JDK)
- Maven 3.9+
- Node.js 20+ & npm
- Docker Engine & Docker Compose

### 2. Backend Setup
```bash
cd backend
mvn clean spring-boot:run
```
*(Backend API runs at `http://localhost:8080`)*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(Frontend runs at `http://localhost:3000`)*

---

## 🔑 Demo Credentials

- **Customer User**: `john@example.com` / `admin123`
- **Organizer User**: `admin@ticketapp.com` / `admin123`

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
