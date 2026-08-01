# 🔥 Fuego Dance

Sitio web y plataforma de gestión para **Fuego Dance**, academia de Salsa Casino con presencia en Curicó, Talca y Rancagua.

La aplicación muestra la información de la academia, publicaciones de Instagram, galería de fotos, figuras de baile y formularios de contacto. El backend también incluye autenticación y herramientas administrativas para gestionar el contenido.

## Funcionalidades

- **Página principal:** presentación de Fuego Dance, propuesta de valor, sedes y llamados a la acción.
- **Publicaciones de Instagram:** feed conectado con el perfil oficial de Fuego Dance.
- **Galería:** álbumes por evento, navegación, lightbox y carga de imágenes optimizadas en WebP.
- **Figuras de Salsa Casino:** contenido y videos organizados para practicar.
- **Panel administrativo:** autenticación y gestión de galería, figuras, videos y usuarios.
- **Formulario de contacto:** recepción de mensajes desde el sitio.
- **SEO básico:** títulos, descripciones, URL canónica, robots.txt y sitemap.

## Tecnologías

### Frontend

- React 18
- Vite 5
- React Router
- Tailwind CSS
- `lucide-react` para iconos
- `react-helmet-async` para metadatos SEO
- Nginx Alpine para servir el build de producción

### Backend

- Python 3.11
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite por defecto
- PostgreSQL compatible mediante `DATABASE_URL`
- Pillow para procesamiento de imágenes

### Despliegue

- Docker y Docker Compose
- Red privada `fuego-net` entre frontend y backend
- Nginx como servidor web y proxy inverso
- Volúmenes Docker para la base de datos y las cargas del backend
- En producción, la aplicación se administra mediante un stack de Docker/Dockge

## Estructura del proyecto

```text
salsa-academy/
├── backend/
│   ├── app/
│   │   ├── auth.py              # Autenticación y usuario administrador inicial
│   │   ├── database.py          # Conexión y configuración de SQLAlchemy
│   │   ├── models/              # Modelos de base de datos
│   │   ├── routers/             # Endpoints de la API
│   │   │   ├── admin.py
│   │   │   ├── contact.py
│   │   │   ├── figures.py
│   │   │   ├── gallery.py
│   │   │   ├── instagram.py
│   │   │   ├── users.py
│   │   │   └── videos.py
│   │   └── main.py              # Aplicación FastAPI y registro de rutas
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── common/
│   │   │   ├── home/
│   │   │   ├── instagram/
│   │   │   └── layout/
│   │   ├── data/                # Contenido estático del frontend
│   │   ├── hooks/                # Hooks de autenticación y API
│   │   ├── pages/                # Rutas y vistas de la aplicación
│   │   ├── services/             # Servicios de comunicación con la API
│   │   └── assets/               # Imágenes y recursos importados
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── nginx/
│   └── nginx.conf               # Configuración del proxy de producción
├── optimize_images.py            # Genera thumbnails y WebP optimizados
├── docker-compose.yml            # Entorno Docker del proyecto
└── README.md
```

## Requisitos

Para trabajar localmente se necesita:

- Docker Engine
- Docker Compose v2 (`docker compose`)
- Git

Para ejecutar solamente el frontend sin Docker:

- Node.js 20 o superior
- npm

## Configuración

El backend utiliza estas variables de entorno:

- `DATABASE_URL`: URL de la base de datos. Por defecto, el Compose usa `sqlite:///./db/fuego_dance.db`.
- `INSTAGRAM_ACCESS_TOKEN`: token opcional para consultar el feed de Instagram. Si no se define, se utiliza el comportamiento alternativo configurado por la aplicación.

No se deben subir tokens, contraseñas ni archivos `.env` al repositorio.

## Ejecución con Docker Compose

Desde la raíz del repositorio:

```bash
docker compose up -d --build
```

El sitio queda disponible en:

```text
http://localhost:8083
```

La API queda disponible a través del frontend en `/api/`. Para consultar la documentación interactiva de FastAPI, se puede acceder directamente al contenedor backend o publicar temporalmente su puerto en un entorno de desarrollo.

### Comandos habituales

```bash
# Ver el estado de los servicios
docker compose ps

# Ver logs del frontend
docker compose logs -f frontend

# Ver logs del backend
docker compose logs -f backend

# Detener los servicios
docker compose down

# Detener los servicios y eliminar también los volúmenes del proyecto
# Atención: esto elimina la base de datos y las cargas persistentes.
docker compose down -v
```

## Desarrollo del frontend

```bash
cd frontend
npm install
npm run dev
```

El servidor de Vite normalmente queda en `http://localhost:5173`.

Comandos disponibles:

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Vista previa del build
```

## Build de producción del frontend

```bash
cd frontend
npm ci
npm run build
```

El resultado se genera en `frontend/dist/`.

El `Dockerfile` del frontend realiza automáticamente estas etapas:

1. Instala las dependencias con Node.js.
2. Ejecuta `npm run build`.
3. Copia `dist/` a una imagen Nginx Alpine.

## API principal

La API FastAPI se monta bajo el prefijo `/api` y ofrece, entre otras, estas rutas:

- `GET /api/health` — comprobación de salud.
- `GET /api/figures` — figuras de baile.
- `GET /api/gallery/` — fotografías de la galería.
- `GET /api/videos` — videos.
- `GET /api/instagram/feed` — publicaciones de Instagram.
- `POST /api/contact` — formulario de contacto.
- `/api/admin/*` — operaciones protegidas de administración.

La documentación automática de FastAPI está disponible en `/docs` cuando se accede directamente al backend.

## Optimización de imágenes

El script `optimize_images.py` procesa los originales ubicados en:

```text
/mnt/sda/fuegodance/gallery/
```

Y genera:

```text
/mnt/sda/fuegodance/thumbnails/  # WebP de hasta 400 px
/mnt/sda/fuegodance/web/         # WebP de hasta 1600 px
```

El procesamiento aplica la orientación EXIF antes de generar las imágenes y no modifica los originales.

Para ejecutarlo:

```bash
python3 optimize_images.py
```

El script requiere Pillow:

```bash
python3 -m pip install Pillow
```

En sistemas con PEP 668 se recomienda utilizar un entorno virtual:

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install Pillow
python optimize_images.py
```

## Persistencia y archivos

El Compose define dos volúmenes persistentes:

- `fuego-db`: base de datos SQLite.
- `fuego-uploads`: imágenes, videos y otros archivos cargados por el backend.

El frontend también monta `/mnt/sda/fuegodance` como `/var/www/gallery` para servir directamente las versiones optimizadas de la galería mediante Nginx. Si esa ruta no existe en otro equipo, hay que crearla o modificar el volumen en `docker-compose.yml` antes de iniciar el frontend.

## Despliegue

El despliegue de producción utiliza una imagen frontend publicada como:

```text
arturoalvarez/fuego-dance-web:latest
```

Antes de desplegar cambios:

1. Revisar el estado de Git y los cambios pendientes.
2. Ejecutar `git diff --check`.
3. Construir y probar el frontend con `npm run build` o Docker.
4. Verificar la API y el sitio mediante navegador.
5. Recrear el servicio frontend cuando cambie la imagen:

```bash
docker compose up -d --force-recreate frontend
```

Después del despliegue se debe comprobar, como mínimo:

```bash
curl -fsS http://localhost:8083/
curl -fsS http://localhost:8083/api/health
```

También conviene revisar la consola del navegador y comprobar que las imágenes principales no tengan respuestas HTTP 404.

## Flujo de trabajo Git

```bash
# Revisar cambios
git status --short
git diff --check

# Crear un commit
git add -A
git commit -m "descripción del cambio"

# Publicar en el remoto
git push origin master
```

No se deben versionar secretos, tokens, bases de datos locales, directorios `dist/` o `node_modules/`.

## Licencia y contenido

El contenido de marca, fotografías, videos y publicaciones de Fuego Dance pertenece a sus respectivos propietarios. Antes de publicar material nuevo, se debe confirmar que existe autorización para utilizarlo.
