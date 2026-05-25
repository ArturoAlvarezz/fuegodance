# Fuego Dance - Salsa Academy

Aplicación web para academia de baile "Fuego Dance" con gestión de contenido multimedia, galería de videos, figuras de salsa, y sistema de contactos.

## Stack

- **Frontend**: React + Vite + TailwindCSS (servido con Nginx, puerto 8083)
- **Backend**: Python FastAPI + SQLite con SQLAlchemy (puerto 8000)
- **Base de datos**: SQLite (persistente en volumen)

## Contenedores Docker

| Servicio  | Imagen Docker Hub                        | Puerto | Dockerfile        |
|-----------|------------------------------------------|--------|-------------------|
| Backend   | `arturoalvarez/fuego-dance-api:latest`   | 8000   | `./backend/Dockerfile` |
| Frontend  | `arturoalvarez/fuego-dance-web:latest`   | 8083   | `./frontend/Dockerfile` |

## Estructura del proyecto

```
salsa-academy/
├── backend/
│   ├── app/           # Aplicación FastAPI
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── database.py
│   │   └── routers/   # Endpoints (videos, gallery, contact, etc.)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/           # Aplicación React
│   ├── dist/          # Build de producción
│   ├── Dockerfile
│   └── nginx.conf
├── nginx/
│   └── nginx.conf     # Configuración Nginx global
├── docker-compose.yml
├── README.md
└── AGENTS.md
```

## CI/CD

El workflow de GitHub Actions (`deploy.yml`) se encarga de:
1. Buildear las imágenes Docker (backend y frontend)
2. Pushearlas a Docker Hub
3. Los secrets `DOCKER_USERNAME` y `DOCKER_TOKEN` deben estar configurados en GitHub

## Variables de entorno

- `DATABASE_URL`: URL de conexión a SQLite
- `INSTAGRAM_ACCESS_TOKEN`: Token de acceso a Instagram API (opcional)
- `VITE_API_URL`: URL base de la API para el frontend (en tiempo de build)
