<!--
Sync Impact Report:
- Version change: 1.0.0 -> 1.1.0
- Modified principles:
  - I. Angular Platform: expanded with full tech stack requirements
  - II. Local-First Data Storage: expanded with explicit forbidden dependencies
  - III. Arabic Language & RTL Layout: expanded with full requirements list
  - IV. Modern UI & UX: expanded with full requirements list
  - V. Performance & Scalability: expanded with specific targets
- Added sections: Charting Library, Architecture, Code Quality, Deliverable Expectations
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md (⚠ pending)
  - .specify/templates/spec-template.md (⚠ pending)
  - .specify/templates/tasks-template.md (⚠ pending)
- Follow-up TODOs: None
-->

# Habit Tracker Constitution

## Core Principles

### I. Angular Platform (NON-NEGOTIABLE)
The application MUST be developed **entirely with Angular** (latest stable version).

**Required tech stack:**
- Angular (latest stable)
- TypeScript
- Angular Signals where appropriate
- Standalone Components
- Reactive Forms
- Angular Router
- RxJS only when necessary
- SCSS for styling

**Absolutely forbidden:**
- No backend
- No server-side rendering
- No authentication
- No cloud services
- No APIs
- No database

Everything MUST run completely in the browser.

### II. 100% Local-First Data Storage (NON-NEGOTIABLE)
The application is **100% local-first**. All data MUST be stored inside **LocalStorage**.

**The project MUST NEVER depend on:**
- Backend
- Firebase
- Supabase
- MongoDB
- SQL
- IndexedDB (unless explicitly requested later)
- REST APIs
- GraphQL
- Authentication

Every feature MUST work completely offline.

### III. Arabic Language & RTL Layout (NON-NEGOTIABLE)
The application targets **Arabic-speaking users**.

**Requirements:**
- Entire UI MUST be in **Arabic**
- Full **RTL (Right-to-Left)** layout
- Proper Arabic typography
- Responsive RTL spacing
- RTL-friendly icons and navigation
- Date and time formatting suitable for Arabic users
- All charts, tooltips, legends, and labels MUST support Arabic text correctly

### IV. Modern UI & UX
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

### V. Performance & Scalability
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

**Version**: 1.1.0 | **Ratified**: 2026-07-03 | **Last Amended**: 2026-07-03
