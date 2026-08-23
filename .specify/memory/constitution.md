<!--
Sync Impact Report:
- Version change: 1.1.0 -> 1.2.0
- Modified principles:
  - I. Angular Platform: removed backend/auth/API/database restrictions
  - II. Local-First Data Storage: changed to backend-first with D1 database
- Added sections: Backend Stack (Cloudflare Workers + D1)
- Removed sections: None
- Templates requiring updates: None
- Follow-up TODOs: None
-->

# Habit Tracker Constitution

## Core Principles

### I. Angular Platform (NON-NEGOTIABLE)
The frontend application MUST be developed **entirely with Angular** (latest stable version).

**Required tech stack:**
- Angular (latest stable)
- TypeScript
- Angular Signals where appropriate
- Standalone Components
- Reactive Forms
- Angular Router
- RxJS only when necessary
- SCSS for styling

**Architecture:**
- Angular frontend (SPA)
- Cloudflare Workers backend API
- D1 database for persistence

### II. Backend-First Data Storage (NON-NEGOTIABLE)
The application uses a **backend-first architecture** with Cloudflare Workers and D1 database.

**Required stack:**
- Cloudflare Workers (serverless backend)
- D1 database (SQLite-compatible, edge-ready)
- JWT authentication for protected endpoints
- All data persisted in D1

**Data access pattern:**
- Frontend communicates with backend via REST API
- Backend handles all database operations
- JWT tokens for user authentication and data isolation

### III. Backend Stack (NON-NEGOTIABLE)
The backend MUST use **Cloudflare Workers** with **D1 database**.

**Required tech stack:**
- Cloudflare Workers (runtime)
- Hono (web framework)
- @hono/zod-openapi (API documentation)
- Zod (validation)
- D1 database (SQLite-compatible)
- JWT authentication

**Forbidden:**
- No Firebase
- No Supabase
- No MongoDB
- No external databases

### IV. Arabic Language & RTL Layout (NON-NEGOTIABLE)
The application targets **Arabic-speaking users**.

**Requirements:**
- Entire UI MUST be in **Arabic**
- Full **RTL (Right-to-Left)** layout
- Proper Arabic typography
- Responsive RTL spacing
- RTL-friendly icons and navigation
- Date and time formatting suitable for Arabic users
- All charts, tooltips, legends, and labels MUST support Arabic text correctly

### V. Modern UI & UX
The application MUST provide a modern, clean dashboard experience.

**Requirements:**
- Responsive Design (mobile-first)
- Dark Mode & Light Mode
- Accessible UI
- Smooth animations
- Loading states
- Empty states
- Error states
- Reusable components

### VI. Performance & Scalability
The application MUST remain responsive with large datasets.

**Targets:**
- Support at least **100,000 relapse records**
- Fast filtering
- Fast aggregation
- Efficient chart rendering
- Minimal unnecessary Angular change detection

## Charting Library
Choose the **most suitable Angular-compatible chart library** for each visualization rather than forcing a single library for every use case.

**Selection criteria (in priority order):**
1. Excellent Angular integration
2. High performance
3. Responsive charts
4. Dark mode support
5. RTL compatibility
6. Good customization
7. Active maintenance
8. Minimal bundle size

## Architecture
The project MUST follow a **scalable feature-based architecture**.

**Requirements:**
- Feature-based folder structure
- Separation of concerns
- Reusable services
- Reusable components
- Reusable analytics engine
- Strong typing
- SOLID principles
- Clean code
- Easily extensible for future features

## Code Quality
Every phase MUST include:
- Strict TypeScript typing
- Interfaces & Models
- Reusable utilities
- Proper error handling
- No duplicated logic

## API Documentation
- All backend endpoints MUST use `@hono/zod-openapi` to automatically generate an OpenAPI specification.
- The Swagger documentation must be kept up to date for any created or modified endpoints.
- Backend runs on Cloudflare Workers with D1 database.

## Deliverable Expectations
Each implementation phase MUST deliver:
- Folder structure
- Components
- Services
- Interfaces & Models
- Business logic
- State management (if needed)
- Styling
- Validation
- Clear separation between UI and business logic

## Governance
This Constitution supersedes all other documentation and practices.
Amendments require explicit user approval and MUST be reflected in this file with a version bump.
All implementation plans and reviews MUST verify compliance with these principles.

**Version**: 1.2.0 | **Ratified**: 2026-07-03 | **Last Amended**: 2026-08-23
