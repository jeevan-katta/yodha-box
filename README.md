# 🔥 Yodha Nets Pro

**Hyderabad's Premium Pickleball & Box Cricket Arena** — Booking Platform at Safilguda

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Payment**: Razorpay Integration
- **Auth**: Phone-only login (users) + Email/Password (admin)

## 📁 Project Structure

```
yodha/
├── server/          # Express backend
│   └── src/
│       ├── config/       # DB, env, Razorpay setup
│       ├── controllers/  # Route handlers
│       ├── middleware/    # Auth, error handling
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Express routes
│       ├── services/     # Business logic
│       ├── types/        # TypeScript interfaces
│       ├── utils/        # Helpers & seed script
│       └── server.ts     # Entry point
├── client/          # React frontend
│   └── src/
│       ├── components/   # Reusable UI
│       ├── context/      # Auth context
│       ├── pages/        # Route pages
│       ├── services/     # API layer
│       ├── types/        # TypeScript interfaces
│       ├── utils/        # Helpers
│       ├── App.tsx       # Routes & auth guards
│       └── main.tsx      # Entry point
```

## 🛠️ Setup & Run

## Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas URI)
- Razorpay account (test keys)

### 1. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

Edit `server/.env` with your:
- MongoDB URI
- Razorpay keys
- JWT secret

### 3. Seed Database

```bash
cd server && npm run seed
```

This creates the default admin account and pricing rules.

### 4. Start Development

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

## 🔑 Default Credentials

- **Admin**: admin@yodhanets.com / admin@123
- **User**: Any valid 10-digit Indian phone number

## 💰 Pricing

| Day     | Time              | Price  |
|---------|-------------------|--------|
| Weekday | 6:00 AM - 6:00 PM | ₹600   |
| Weekday | 6:00 PM - 6:00 AM | ₹800   |
| Weekend | 6:00 AM - 6:00 PM | ₹800   |
| Weekend | 6:00 PM - 6:00 AM | ₹1000  |

Pricing is **dynamic** and managed through the admin panel.

## 🔒 Double Booking Prevention

1. User selects a slot → slot is **atomically locked** for 5 minutes
2. MongoDB TTL index auto-expires stale locks
3. Payment is processed through Razorpay
4. Only **after payment verification** is the booking confirmed
5. Unique compound index prevents concurrent insertions

## 📱 Features

### User
- Phone-only login (no password, no OTP)
- View slots for both turfs in a visual grid
- Date picker with 2-week range
- Color-coded slot status (green/red/grey)
- Secure Razorpay payment flow
- Booking history with cancellation

### Admin
- Secure email/password login
- Dashboard with stats & revenue
- Manage all bookings (view, filter, cancel)
- Block/unblock specific time slots
- Edit pricing rules dynamically
