# Fuego Dance - Salsa Academy

Aplicación web para academia de baile "Fuego Dance" con gestión de contenido multimedia, galería de videos, figuras de salsa, y sistema de contactos.

## Stack

- **Frontend**: React + Vite + TailwindCSS (servido con Nginx, puerto 8083)
- **Backend**: Python FastAPI + SQLite con SQLAlchemy (puerto 8000)
- **Base de datos**: SQLite (persistente en volumen)

## Contenedor

Una sola imagen (`Dockerfile` en la raíz): FastAPI sirve la API y el SPA de React compilado. Contenedor `fuego-dance-app`, puerto 8000 dentro; en la VM, 8083 (producción) y 8183 (pruebas).

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

Plantilla CI/CD de Sinopia Labs (`.github/workflows/ci-cd.yml`; centro de conocimiento: *Plantilla CI/CD con GitHub Actions*):

1. Un PR despliega a pruebas: `/opt/stacks/fuego-dance-app-pruebas`, puerto 8183, con datos propios en `./data`.
2. El merge a la rama principal despliega a producción: `/opt/stacks/fuego-dance-app`, puerto 8083 (fuegodance.cl). Usa los datos de siempre: las rutas están en su `.env` (`SUBIDAS`, `INSTAGRAM`, `BASE`).
3. Antes de reiniciar, `deploy/antes.sh` copia la base. Si `/api/health` no responde, vuelve solo a la versión anterior.
4. A pedido: `gh workflow run ci-cd.yml -R ArturoAlvarezz/fuegodance -f destino=produccion`.

## Variables de entorno

- `DATABASE_URL`: URL de conexión a SQLite
- `INSTAGRAM_ACCESS_TOKEN`: Token de acceso a Instagram API (opcional)
- `VITE_API_URL`: URL base de la API para el frontend (en tiempo de build)
