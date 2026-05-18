# 🕺 Salsa Academy

Web platform for the salsa dance academy.

## Features
- **Academy Info** — About, instructors, schedule, location
- **Instagram Feed** — Embedded latest posts from Instagram
- **Photo Gallery** — Photos from socials and events
- **Figure Videos** — Salsa move breakdowns for home practice

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI + SQLite (or PostgreSQL)
- **Deploy:** Docker + Portainer stack

## Project Structure
```
salsa-academy/
├── frontend/        # React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Navbar, Footer, Layout
│   │   │   ├── home/        # Hero, About, Features
│   │   │   ├── gallery/     # Photo grid, lightbox
│   │   │   ├── instagram/   # IG feed embed
│   │   │   ├── figures/     # Video cards, categories
│   │   │   └── common/      # Buttons, Cards, etc.
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/        # API calls
│   │   ├── assets/
│   │   └── styles/
│   ├── Dockerfile
│   └── ...
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/        # API routes
│   │   ├── models/         # DB models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── Dockerfile
│   └── ...
├── nginx/                  # Reverse proxy config
│   └── nginx.conf
├── docker-compose.yml      # Portainer stack
└── README.md
```

## Quick Start
```bash
# Development
docker-compose up

# Production (Portainer stack)
# Paste docker-compose.yml into Portainer Stacks
```
