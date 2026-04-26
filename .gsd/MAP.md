# Codebase Map

## Core Framework
- **Project Type:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4

## Directory Structure
- `src/app/`: Primary routing.
    - `(customer)/`: Public-facing store.
    - `admin/`: Super-admin screens.
    - `vendor/`: Vendor dashboard & settings.
- `src/components/`:
    - `UI/`: Basic atoms (Buttons, Inputs).
    - `Vendor/`: Vendor-specific components.
    - `Customer/`: Storefront elements.
- `src/context/`:
    - `AuthContext.tsx`: Manages user sessions and roles.
- `src/lib/`:
    - `firestore.ts`: CRUD operations and listeners.
    - `firebase.ts`: SDK initialization.
- `src/constants/`:
    - `theme.ts`: Brand colors (Orange/Gray).
