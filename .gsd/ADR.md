# Architecture Decision Records (ADR)

## ADR 1: Technology Stack
- **Decision:** Use Next.js 16 (App Router) + Firebase (Firestore/Auth).
- **Rationale:** Next.js provides excellent SEO and performance, while Firebase allows for rapid development of real-time features like order tracking and role-based auth without a complex custom backend.

## ADR 2: Role-Based Access Control (RBAC)
- **Decision:** Implement a three-tier role system: `customer`, `vendor`, `admin`.
- **Rationale:** This mirrors the multi-vendor requirement. Regular users can "request" an upgrade to a vendor, and admins must "approve" that request before they can sell.

## ADR 3: Data Schema for Menu Items
- **Decision:** Store menu items in a sub-collection: `vendors/{vendorId}/dishes/{dishId}`.
- **Rationale:** This prevents a single `vendors` document from hitting the 1MB limit as more dishes are added, and allows for efficient category-based filtering.

## ADR 4: Payment Integration
- **Decision:** Use Razorpay for the Indian market (UPI, Cards).
- **Rationale:** High compatibility with UPI and mobile wallets.
