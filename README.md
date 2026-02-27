# Carly Project

Final project for the course **Programming Multilayered and Mobile Apps Based on React**.

## Project Brief

Carly is a multi-module booking platform with:
- `web/`: React + TypeScript admin frontend for managing users, cars, bookings, and partner bookings.
- `backend/`: Spring Boot API.
- `mobile/`: Expo/React Native mobile app for customers.

The frontend includes login/route protection, CRUD flows, filtering, pagination, and partner booking views (Parkly/Flatly).

## Documentation

- Backend docs: [backend/README.md](./backend/README.md)
- Mobile app docs: [mobile/README.md](./mobile/README.md)

## My Contribution (Frontend)

- Implemented and refined core frontend architecture (routing, reusable UI components, typed services).
- Built/extended Users, Cars, and Bookings management flows (create, edit, view, list).
- Added filtering and pagination improvements across key data tables.
- Implemented login flow and protected routes.
- Added partner booking pages and Flatly/Parkly-related booking handling improvements.
- Refactored frontend structure and removed legacy/KPI pages to stabilize build output.

## Run Frontend

Prerequisites:
- Node.js 20+ (recommended)
- npm

Commands:

```bash
cd web
npm install
npm run dev
```

Build for production:

```bash
cd web
npm run build
npm run preview
```
