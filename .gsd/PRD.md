# Project Requirement Document (PRD)

## Project Overview
**Project Name:** LunchNow
**Vision:** A premium multi-vendor food marketplace (Zomato-clone) that empowers local kitchens, provides customers with a seamless ordering experience, and gives admins total control over the ecosystem.

---

## User Personas

### 👤 1. Customers
- **Goal:** Find great food, order easily, and get it delivered fast.
- **Key Features:**
    - Browse/Search restaurants (Location-based).
    - Filter by Price, Rating, Veg/Non-Veg.
    - View interactive menus with images.
    - Cart management & Checkout.
    - Live Order Tracking & History.
    - Ratings & Reviews.

### 🏪 2. Vendors (Restaurants/Kitchens)
- **Goal:** Reach more customers and manage kitchen operations efficiently.
- **Key Features:**
    - Become a Partner (Onboarding & Verification).
    - Menu Management (Add/Edit/Delete with Custom Categories).
    - Real-time Order Alerts & Management (Accept/Reject).
    - Earnings Dashboard & Sales Analytics.
    - Availability Control (Open/Close timings).

### 🛠️ 3. Admins (Super Control)
- **Goal:** Ensure platform reliability, safety, and profitability.
- **Key Features:**
    - Vendor Moderation (Approve/Reject new partners).
    - User & Order Management.
    - Commission System Configuration.
    - Payment Settlements.
    - Fraud Detection & Dispute Handling.

---

## Core Workflows

### 🛒 Ordering Flow
1. Customer searches/selects a restaurant.
2. Adds items to cart.
3. Payment processed via Razorpay (UPI/Card/COD).
4. Vendor receives real-time alert via Firestore.
5. Vendor Accepts/Prepares the food.
6. Customer tracks the status live.
7. Delivery & Settlement.

---

## Technical Targets
- **SSR/SSG:** Next.js 16 App Router for SEO and performance.
- **Real-time:** Firestore `onSnapshot` for order notifications.
- **Styling:** Tailwind 4 with custom Zomato-inspired color tokens.
- **Animations:** Framer Motion for premium feel.
