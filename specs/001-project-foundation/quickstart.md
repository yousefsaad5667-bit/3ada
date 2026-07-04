# Quickstart: Habit Tracker — Project Foundation

**Date**: 2026-07-03
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- A modern browser (Chrome, Firefox, or Safari)

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd habit-tracker

# Install dependencies
npm install

# Start the development server
ng serve
```

The application launches at `http://localhost:4200`.

## What You'll See

On first load:
- Dark-themed Arabic interface with RTL layout
- Sidebar navigation on the right with links to all registered routes
- Header bar with the app name (متتبع العادات) and a theme toggle button
- The Dashboard placeholder page as the default route

## Available Routes

| URL | Page | Arabic Label |
|---|---|---|
| `/` | Dashboard | لوحة التحكم |
| `/relapses` | Relapse Management | إدارة الانتكاسات |
| `/analytics/time-series` | Time Series | تحليل السلاسل الزمنية |
| `/analytics/calendar` | Calendar | تحليل التقويم |
| `/analytics/patterns` | Time Patterns | أنماط الوقت |
| `/analytics/triggers` | Triggers | تحليل المحفزات |
| `/analytics/urge` | Urge Analysis | تحليل الرغبة |
| `/charts` | Charts Library | مكتبة الرسوم البيانية |
| `/settings` | Settings | الإعدادات |

All routes currently render placeholder content. Each will be implemented in its
corresponding future phase.

## Available Commands

```bash
# Development server
ng serve

# Lint check
ng lint

# Format check
npx prettier --check "src/**/*.{ts,html,scss}"

# Format fix
npx prettier --write "src/**/*.{ts,html,scss}"

# Build (production)
ng build --configuration production
```

## Project Structure at a Glance

```
src/app/
├── core/        → Singleton services (ThemeService, StorageService), constants, models
├── shared/      → Reusable components (Shell, Header, Sidebar, StorageWarning, NotFound)
├── features/    → Feature modules (one folder per phase, lazy-loaded)
```

## Theme Toggling

Click the moon/sun icon in the header to switch between dark and light mode.
The preference is saved to LocalStorage and persists across sessions.

## Offline Support

The application runs entirely in the browser with no backend dependencies.
All fonts are self-hosted. Every feature works without an internet connection.
