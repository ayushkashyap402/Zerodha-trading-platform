# Zerodha Clone — Full Stack Trading Platform

A full-stack Zerodha Kite clone built with the MERN stack. Users can sign up, log in, manage their portfolio, buy/sell stocks, track holdings and orders — all with complete per-user data isolation.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 19, Vite, React Router, Bootstrap |
| Dashboard | React 18, Create React App, Chart.js, MUI |
| Backend   | Node.js, Express 5, MongoDB, Mongoose   |
| Auth      | JWT (jsonwebtoken), bcrypt, HTTP cookies |
| Database  | MongoDB Atlas                           |

---

## Project Structure

```
Zerodha Project/
├── frontend/        # Landing page — Home, Signup, Login, About, Pricing, etc.
├── dashboard/       # Trading dashboard — Holdings, Orders, Positions, Watchlist
└── backend/         # REST API — Auth, Orders, Holdings, Positions, Watchlist, Funds
```

---

## Features

### Authentication
- Signup with email, password, captcha verification
- Login with JWT token — stored via URL handoff to dashboard (cross-origin localStorage)
- Auth guard on dashboard — token verified with `/me` on every load
- Auto-logout on token expiry or invalid session
- Per-user complete data isolation (every API query scoped by `userId`)

### Trading Dashboard
- **Watchlist** — 9 default stocks on signup, live search/filter
- **Buy / Sell** — MARKET and LIMIT order types, real-time balance check before order
- **Holdings** — auto-updated on every buy/sell, weighted average cost calculation
- **Positions** — open positions with P&L
- **Orders** — full order history with BUY/SELL badges and timestamps
- **Funds** — real account balance, add/withdraw funds
- **Profile** — edit name, phone, PAN, DOB, address; view account stats

### Account & Balance
- Every new user gets **₹5,000 starting balance**
- BUY deducts from balance, SELL credits back
- Insufficient balance check before placing order
- Dashboard updates immediately after every trade (custom `orderPlaced` event)

### Frontend Landing Pages
- Home, About, Product, Pricing, Support pages
- Navbar with Login/Signup dropdown

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/zerodha-clone.git
cd zerodha-clone
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/zerodha
TOKEN_KEY=your_jwt_secret_key_here
PORT=3002
```

Start backend:

```bash
npm start
```

### 3. Frontend setup (Landing pages)

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:3002
```

Start frontend:

```bash
npm run dev
# Runs on http://localhost:3000
```

### 4. Dashboard setup

```bash
cd dashboard
npm install
```

Create `dashboard/.env`:

```env
PORT=3001
```

Start dashboard:

```bash
npm start
# Runs on http://localhost:3001
```

---

## Ports

| Service   | Port  | URL                       |
|-----------|-------|---------------------------|
| Frontend  | 3000  | http://localhost:3000     |
| Dashboard | 3001  | http://localhost:3001     |
| Backend   | 3002  | http://localhost:3002     |

---

## API Reference

### Auth
| Method | Endpoint  | Description              | Auth |
|--------|-----------|--------------------------|------|
| POST   | /signup   | Create account           | —    |
| POST   | /login    | Login, returns JWT token | —    |
| GET    | /me       | Verify token, get user   | ✅   |
| POST   | /logout   | Clear session cookie     | ✅   |

### Profile & Funds
| Method | Endpoint        | Description              | Auth |
|--------|-----------------|--------------------------|------|
| GET    | /profile        | Get user profile         | ✅   |
| PUT    | /profile        | Update profile fields    | ✅   |
| GET    | /funds          | Get balance & margin     | ✅   |
| POST   | /funds/add      | Add funds to account     | ✅   |
| POST   | /funds/withdraw | Withdraw available funds | ✅   |

### Trading
| Method | Endpoint         | Description                           | Auth |
|--------|------------------|---------------------------------------|------|
| GET    | /allHoldings     | Get user's holdings                   | ✅   |
| GET    | /allPositions    | Get open positions                    | ✅   |
| GET    | /allOrders       | Get order history                     | ✅   |
| POST   | /newOrder        | Place BUY/SELL order (updates balance)| ✅   |
| GET    | /allWatchlist    | Get watchlist                         | ✅   |
| POST   | /addToWatchlist  | Add stock to watchlist                | ✅   |
| DELETE | /removeFromWatchlist/:name | Remove from watchlist      | ✅   |

---

## User Flow

```
1. Open http://localhost:3000
2. Click Signup → fill details → account created with ₹5,000 balance
3. Auto-redirected to dashboard (http://localhost:3001)
4. Watchlist loaded with 9 default stocks
5. Hover a stock → Buy / Sell buttons appear
6. Place order → balance updates immediately
7. View Holdings, Orders, Positions, Funds in sidebar
8. Click avatar → Profile page → edit personal details
9. Logout from avatar dropdown
```

---

## Environment Variables

### backend/.env
```env
MONGO_URL=          # MongoDB connection string
TOKEN_KEY=          # JWT signing secret (keep this strong and private)
PORT=3002           # Backend port
```

### frontend/.env
```env
VITE_BACKEND_URL=http://localhost:3002
```

### dashboard/.env
```env
PORT=3001
```

---

## Security Notes

- JWT tokens expire after **3 days**
- Passwords hashed with **bcrypt** (12 salt rounds)
- All trading routes protected by `verifyToken` middleware
- Every DB query filtered by `userId` — no cross-user data leakage
- CORS configured to allow only known origins

---

## Screenshots

> Dashboard — Summary view with real-time margin, P&L, and recent orders

> Holdings — per-user stock holdings with weighted average cost

> Buy/Sell window — MARKET and LIMIT orders with balance check

---

## License

MIT
