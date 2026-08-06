# 🧪 TIXFLOW — Step-by-Step Manual QA Testing Guide

This guide provides a comprehensive, step-by-step manual testing protocol for all **TIXFLOW** features, including the **Luma/Vercel Editorial UI**, **Role-Based Access Control (RBAC)**, **Admin Publishing Portal**, **Real-time Redis Seat Locks**, **Dynamic Anti-Fraud QR Codes**, **P2P Ticket Transfers**, and **Cloud Run Deployment**.

---

## 🛠️ Testing Environment Details

### Live Cloud Production Deployment:
- **Frontend Web Application**: [https://tixflow-frontend-bauggozpgq-as.a.run.app](https://tixflow-frontend-bauggozpgq-as.a.run.app)
- **Admin Event Portal**: [https://tixflow-frontend-bauggozpgq-as.a.run.app/admin/events/create](https://tixflow-frontend-bauggozpgq-as.a.run.app/admin/events/create)
- **Backend REST API**: [https://tixflow-backend-bauggozpgq-as.a.run.app](https://tixflow-backend-bauggozpgq-as.a.run.app)
- **Actuator Health Telemetry**: [https://tixflow-backend-bauggozpgq-as.a.run.app/actuator/health](https://tixflow-backend-bauggozpgq-as.a.run.app/actuator/health)

### Local Dev Server:
- **Frontend App**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:8080`

### Pre-Configured Test Accounts (Seed Data):
| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **`USER`** (Customer) | `john@example.com` | `admin123` | Event Discovery, Seat Map Selection, Checkout, PDF E-Tickets, Dynamic QR, P2P Transfer |
| **`ADMIN`** (Promoter/Gatekeeper) | `admin@ticketapp.com` | `admin123` | Admin Console, Publish Events, Revenue Telemetry, Gatekeeper Scanner App |

---

## 📋 Comprehensive Test Suite Matrix

---

### 🟢 Scenario 1: Authentication & Role-Based Access Control (RBAC)

#### Test Objective:
Verify user login, JWT token persistence, and strict RBAC separation between Customer (`USER`) and Admin (`ADMIN`) roles.

#### Step-by-Step Instructions:
1. Open [https://tixflow-frontend-bauggozpgq-as.a.run.app](https://tixflow-frontend-bauggozpgq-as.a.run.app).
2. Click **"Sign In"** on the top navigation bar.
3. Enter Email: `john@example.com`, Password: `admin123`. Click **"Sign In"**.
4. Verify the top right header shows **"John"** with role badge **`USER`**.
5. Observe that the **"Admin Console"** dropdown is **hidden** for customer accounts.
6. Now, manually navigate to `/admin/events/create` in your browser address bar.
7. Sign out, then sign in with Admin credentials: `admin@ticketapp.com` / `admin123`.
8. Observe the navbar now displays the gold **"Admin Console"** dropdown menu and **`ADMIN`** badge.

#### Expected Results:
- ✅ **`USER` Account**: Logging in as John displays "My Tickets" and "Discover Events" only.
- ✅ **Route Protection**: Manually entering `/admin/events/create` while logged in as `USER` renders an **"Access Denied"** guard page.
- ✅ **`ADMIN` Account**: Logging in as Admin reveals the **"Admin Console"** dropdown (`Publish New Event`, `Organizer Telemetry`, `Gatekeeper Scanner`).

---

### 🟢 Scenario 2: Admin Event & Stadium Seat Layout Publishing

#### Test Objective:
Verify that an Admin can publish a new headline event with venue, date, pricing tiers, and automated stadium seat generation.

#### Step-by-Step Instructions:
1. Sign in as Admin (`admin@ticketapp.com` / `admin123`).
2. Click **"Admin Console"** -> **"Publish New Event"** (or go to `/admin/events/create`).
3. Fill out the form fields:
   - **Event Title**: `Coldplay Music of the Spheres Tour 2026`
   - **Category**: Select `Concerts & Music`
   - **Poster Image URL**: Leave default or paste any image URL.
   - **Start & End Time**: Select upcoming dates.
   - **VIP Tier Price**: `2500000` (Rp 2,500,000)
   - **Regular Tier Price**: `1200000` (Rp 1,200,000)
   - **Toggles**: Keep `Virtual Waiting Room Queue` and `Dynamic Pricing` checked.
4. Click **"Publish Event & Generate Seats"**.

#### Expected Results:
- ✅ Success alert appears: `"Success! Event published and 24 stadium seats auto-generated."`
- ✅ Browser redirects to the newly created event page.
- ✅ 24 seat tiles (Rows A & B for VIP, Rows C & D for Regular) are generated in AVAILABLE status.

---

### 🟢 Scenario 3: Real-Time Interactive Seat Selection & Redis Concurrency Locks

#### Test Objective:
Verify that seat holds are protected by **Redis Distributed Locks** (`SeatLockService`) with a 10-minute hold TTL and live WebSocket STOMP updates.

#### Step-by-Step Instructions:
1. Open **Browser 1** (Customer John: `john@example.com`).
2. Open any event detail page (e.g. `/events/1`).
3. Under the interactive stadium seat map, select **Row A - Seat 1** and **Row A - Seat 2**.
4. Observe the sticky bottom drawer showing 2 selected seats and total investment amount.
5. Open **Browser 2 (Incognito)** and view the same event page (`/events/1`).
6. Observe **Row A - Seat 1** in Browser 2: It should show as locked/held (yellow pulse or disabled state).
7. In Browser 1, click **"Reserve Seats & Proceed to Payment"**.

#### Expected Results:
- ✅ **Atomic Lock**: Seat lock is written to Redis key `seat:lock:{eventId}:{seatId}` for 600 seconds.
- ✅ **Double-Booking Prevention**: Attempting to click a held seat in Browser 2 returns a lock warning.
- ✅ **Reservation Checkout**: Browser 1 creates a booking record in status `PENDING` with a unique booking code (e.g. `TIX-7A8B9C`).

---

### 🟢 Scenario 4: Stripe Payment Gateway & Order Confirmation

#### Test Objective:
Verify Stripe Checkout integration and simulated instant payment completion.

#### Step-by-Step Instructions:
1. In Browser 1, after reserving seats, you are redirected to the Checkout page (`/checkout/{bookingId}`).
2. Observe the **10-minute payment countdown timer** (`09:59` counting down).
3. Test Option A: Click **"Pay via Official Stripe Checkout"** -> Redirects to Stripe hosted checkout page.
4. Test Option B: Click **"Simulate Direct Instant Payment (Fast Dev Test)"**.

#### Expected Results:
- ✅ **Countdown Timer**: Displays time remaining before seat lock expires in Redis.
- ✅ **Payment Confirmation**: Clicking instant payment updates booking status to `CONFIRMED`.
- ✅ **E-Ticket Generation**: Individual ticket passes are generated with unique ticket codes and PDF Cloudinary download links.

---

### 🟢 Scenario 5: Dynamic Anti-Fraud TOTP QR Code Generation

#### Test Objective:
Verify dynamic HMAC-SHA256 TOTP QR payload generation to prevent screenshot ticket scalping.

#### Step-by-Step Instructions:
1. Navigate to **"My Tickets"** (`/my-tickets`).
2. Click **"Dynamic QR"** button on any confirmed ticket pass.
3. Observe the pop-up modal displaying a live QR code.
4. Note the dynamic payload string under the QR code (e.g. `TIX-A1B2C3:1786073000:7f8e...`).
5. Wait 30 seconds and observe the automatic refresh indicator.

#### Expected Results:
- ✅ **30-Second Refresh**: QR payload automatically recalculates every 30 seconds using HMAC secret.
- ✅ **Anti-Screenshot**: Screenshots taken more than 30 seconds prior will fail validation at gate check-in.

---

### 🟢 Scenario 6: Peer-to-Peer (P2P) Ticket Ownership Transfer

#### Test Objective:
Verify ticket transferability to another registered user account.

#### Step-by-Step Instructions:
1. In **"My Tickets"**, click **"Transfer Pass"** on a ticket pass.
2. In the modal form, enter recipient email: `admin@ticketapp.com`.
3. Click **"Transfer Ticket Pass"**.
4. Log out of John's account and log in as `admin@ticketapp.com`.
5. Navigate to **"My Tickets"**.

#### Expected Results:
- ✅ Ticket pass is immediately removed from John's account and added to Admin's ticket list.
- ✅ Ticket code remains intact while `currentOwnerId` updates in PostgreSQL.

---

### 🟢 Scenario 7: Gatekeeper QR Scanner & Entrance Verification App

#### Test Objective:
Verify gatekeeper ticket scanning and single-use entrance enforcement (*anti-double check-in*).

#### Step-by-Step Instructions:
1. Sign in as Admin (`admin@ticketapp.com`).
2. Click **"Admin Console"** -> **"Gatekeeper Scanner"** (`/gatekeeper/scan`).
3. Copy a dynamic QR payload string from a valid ticket (e.g. `TIX-A1B2C3:1786073000:7f8e...`).
4. Paste the payload string into the scanner input field and click **"Verify Attendee Pass"**.
5. Repeat the verification with the **same** payload a second time.

#### Expected Results:
- ✅ **First Scan**: Displays green success card: `"ENTRY GRANTED — Valid Pass"` along with Attendee Name and Seat Assignment.
- ✅ **Second Scan (Re-entry)**: Displays red alert card: `"ACCESS DENIED — Ticket has already been scanned at gate."`

---

### 🟢 Scenario 8: Organizer Real-Time Telemetry Analytics

#### Test Objective:
Verify real-time telemetry metrics for revenue, occupancy, and gate entrance counts.

#### Step-by-Step Instructions:
1. Sign in as Admin (`admin@ticketapp.com`).
2. Click **"Admin Console"** -> **"Organizer Telemetry"** (`/organizer/analytics/1`).
3. Review the dashboard metric cards:
   - **Gross Revenue**: Live sum of confirmed booking payments.
   - **Seat Occupancy**: Occupancy percentage bar (`OccupancyRatePercent`).
   - **Seats Reserved**: Ratio of booked seats vs total venue capacity.
   - **Gate Check-Ins**: Live attendee check-in count from gatekeeper scans.

#### Expected Results:
- ✅ All four metric cards display accurate, live telemetry values updated from PostgreSQL.
