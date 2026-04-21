# VendorVerse Marketplace

VendorVerse Marketplace is a full-stack MERN-style marketplace platform built to demonstrate production-minded frontend and backend engineering skills in a single project.

It supports a multi-role commerce workflow where buyers discover products and place orders, vendors manage inventory after admin approval, and admins moderate vendors while tracking platform revenue. The app is designed to showcase role-based UX, API design, business rules, state management, and end-to-end product thinking.

## Why This Project Stands Out

This project is intentionally structured to highlight capabilities relevant to:

- Frontend Engineer roles: responsive React UI, route protection, role-aware screens, shared state with context, search and filtering flows, cart and checkout UX, and motion-enhanced interactions.
- Backend Engineer roles: REST API design, auth and authorization, validation, business rule enforcement, stock updates, error handling, MongoDB modeling, and admin/vendor analytics endpoints.
- MERN Stack roles: complete product flow from UI to database, including auth, commerce logic, role-based dashboards, admin moderation, and local developer experience.

## Core Product Flows

### Buyer

- Register and log in
- Browse approved vendor products
- Search and filter products
- View product details and reviews
- Add items to cart
- Complete checkout with shipping details
- View order history

### Vendor

- Register as a vendor
- Wait for admin approval before selling
- Manage vendor profile
- Create, list, and delete products
- View orders containing vendor products
- See vendor analytics like orders, items sold, and gross sales

### Admin

- Log in with a seeded admin account
- Review pending vendors
- Approve or reject vendor access
- Track platform revenue analytics

## Technical Highlights

- Role-based authentication with JWT
- Protected frontend routes for buyer, vendor, and admin experiences
- REST API organized by domain: auth, products, orders, reviews, vendor, admin
- Validation with `express-validator`
- MongoDB models for users, vendors, products, reviews, and orders
- Checkout flow with stock decrement and rollback protection
- Commission calculation handled by the backend
- Admin moderation workflow for vendor approval
- Vendor analytics and platform revenue reporting
- Vite dev proxy for frontend-to-backend local integration
- Tailwind CSS v4-based styling with Framer Motion interactions

## Architecture Overview

### Frontend

- `React 19`
- `Vite`
- `React Router`
- `Axios`
- `Tailwind CSS v4`
- `Framer Motion`
- `Lucide React`

### Backend

- `Node.js`
- `Express`
- `MongoDB`
- `Mongoose`
- `JWT`
- `bcryptjs`
- `express-validator`

## Project Structure

```text
vendorverse-marketplace/
  backend/
    scripts/
    src/
      config/
      controllers/
      middlewares/
      models/
      routes/
      utils/
  frontend/
    src/
      components/
      context/
      layouts/
      lib/
      pages/
```

## How To Run Locally

### 1. Clone the project

```bash
git clone <your-repo-url>
cd vendorverse-marketplace
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure backend environment variables

Create `backend/.env` and add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=http://localhost:5173

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
```

Notes:

- `MONGODB_URI` should point to your MongoDB database
- local dev CORS also supports `localhost` and `127.0.0.1` origins on common Vite ports
- the admin account is not created through the UI; it is seeded from the backend
- you can copy from `backend/.env.example`

Create `frontend/.env` if you want the frontend to call a deployed backend directly:

```env
VITE_API_URL=http://localhost:5000
```

Notes:

- in local development, leaving `VITE_API_URL` empty also works because Vite proxies `/api` to the backend
- in production, set `VITE_API_URL` to your deployed backend base URL if frontend and backend are hosted separately
- you can copy from `frontend/.env.example`

### 4. Seed the admin account

```bash
cd backend
npm run seed:admin
```

Optional: seed demo data for faster exploration.

```bash
cd backend
npm run seed:demo
```

This seeds:

- 1 admin
- 1 buyer
- multiple vendors
- multiple products

By default, demo vendors are created as pending approval so the admin workflow can be tested.

### 5. Start the backend

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend typically runs on:

```text
http://localhost:5173
```

If that port is busy, Vite may use another local port such as `5174` or `5175`.

## Deploy Readiness

The current repo is close to deploy-ready for a split deployment:

- `frontend` builds successfully for production
- `backend` loads correctly and now has a production `npm start` command
- required environment variables are documented in example env files

Before deploying, make sure:

- your MongoDB database is reachable from your hosting provider
- `JWT_SECRET` is set to a strong random value
- `CORS_ORIGINS` contains your real frontend URL in production
- `VITE_API_URL` points to your backend URL if frontend and backend are deployed separately

Current gaps to be aware of:

- there are no automated backend tests in this repo yet
- admin/demo users still need to be seeded manually after the backend is connected to MongoDB

## How To Deploy

One simple setup is:

1. Deploy `backend` to Render, Railway, or a VPS running Node.js.
2. Deploy `frontend` to Vercel or Netlify.
3. Connect both with environment variables.

### Backend deployment

Use these settings:

- Root directory: `backend`
- Install command: `npm install`
- Start command: `npm start`

Backend environment variables:

- `PORT=5000` if your host expects it, otherwise let the host inject `PORT`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `CORS_ORIGINS=https://your-frontend-domain.com`
- `ADMIN_NAME=Admin`
- `ADMIN_EMAIL=admin@gmail.com`
- `ADMIN_PASSWORD=admin123`

After the backend is live, seed the admin user once:

```bash
cd backend
npm install
npm run seed:admin
```

### Frontend deployment

Use these settings:

- Root directory: `frontend`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Frontend environment variable:

- `VITE_API_URL=https://your-backend-domain.com`

### Suggested hosting combos

- Vercel for frontend + Render for backend + MongoDB Atlas for database
- Netlify for frontend + Railway for backend + MongoDB Atlas for database

### Final production check

After deployment, verify:

- frontend home page loads
- `https://your-backend-domain.com/api/health` returns `{ "ok": true }`
- register/login works
- product list loads from the deployed API
- admin login works after seeding

## How To Use The App

### Buyer Journey

1. Register as a buyer
2. Browse products on the home page
3. Search by keyword or filter by category
4. Open a product detail page
5. Add items to cart
6. Go to checkout and place an order
7. View order history in `My Orders`

### Vendor Journey

1. Register as a vendor and provide a store name
2. Log in and open the vendor dashboard
3. Wait for admin approval before creating products
4. After approval, add products and manage inventory
5. Track vendor orders and stats from the dashboard

### Admin Journey

1. Seed the admin account using `node scripts/seedAdmin.js`
2. Log in with the configured admin credentials
3. Open the admin panel
4. Approve pending vendors
5. Review revenue and order analytics

## Demo Credentials

### Seeded Admin

- Email: `admin@gmail.com`
- Password: `admin123`

These credentials work after running:

```bash
node scripts/seedAdmin.js
```

If you use `seedDemo.js`, additional buyer and vendor demo accounts are also created inside the database.

## API Surface

Main backend route groups:

- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/reviews`
- `/api/vendor`
- `/api/vendor/products`
- `/api/admin`

## Engineering Decisions

- Buyers can only see products from approved vendors
- Vendors cannot sell until approved by admin
- Buyers cannot purchase their own vendor products
- Stock is decremented during checkout with rollback protection
- API responses use centralized error handling
- Role checks are enforced both in the frontend and backend

## Recruiter Notes

This project demonstrates:

- Frontend feature delivery with component-based architecture and route-level access control
- Backend service design with domain separation and business rule enforcement
- Practical full-stack integration between React, Express, MongoDB, and JWT auth
- Ownership of product behavior across UI, API, and data layers

If you are evaluating this project for a Frontend Engineer, Backend Engineer, or MERN Stack role, VendorVerse shows end-to-end implementation across:

- product discovery
- authentication
- commerce workflows
- admin moderation
- state management
- API architecture
- operational local setup

## Current Status

README reflects the current working version of the project in this repository. As features evolve, this file can be updated to match new flows, endpoints, and UI improvements.
