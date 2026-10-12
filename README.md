# 🏠 Home Rental Manager

A web app for landlords to manage rental rooms, tenants, contracts, payments, utility meter readings and expenses.

## Features
- Dashboard and reports
- Rooms and tenants management
- Rental contracts
- Payment tracking and QR-code payment page
- Electricity/water meter readings
- Expenses and notices
- Settings and login

## Tech stack
React · Vite · TypeScript · Tailwind CSS · shadcn/ui · Hono · tRPC · Drizzle ORM (MySQL) · Docker

## Project structure
```
src/      React pages (Dashboard, Rooms, Tenants, Contracts, Payments, ...)
server/   Hono + tRPC routers (rooms, tenants, payments, meter readings, ...)
db/       Drizzle schema, relations and seed data
```

## Run locally
```bash
npm install
cp .env.example .env   # fill in database settings
npm run db:push
npm run dev
```
