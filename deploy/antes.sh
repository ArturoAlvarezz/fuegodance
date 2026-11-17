#!/usr/bin/env bash
# Corre en la VM, dentro de la carpeta del stack, antes de reiniciar el contenedor (lo llama el workflow de CI/CD
# con TMP, IMAGEN, CONTENEDOR y PUERTO definidos).
set -euo pipefail

# Copia consistente de la base antes de desplegar, junto a ella (se guardan las 5 últimas). Se hace dentro del
# contenedor que corre, que es dueño de la carpeta.
if docker ps --format '{{.Names}}' | grep -qx "${CONTENEDOR:?}"; then
  marca=$(date +%Y%m%d-%H%M%S)
  docker exec "$CONTENEDOR" python -c "
import glob, os, sqlite3
if os.path.exists('/app/db/fuego_dance.db'):
    with sqlite3.connect('/app/db/antes-de-desplegar-$marca.db') as copia:
        sqlite3.connect('/app/db/fuego_dance.db').backup(copia)
    for viejo in sorted(glob.glob('/app/db/antes-de-desplegar-*.db'))[:-5]:
        os.remove(viejo)
    print('Copia de la base: antes-de-desplegar-$marca.db')
"
fi

# Primer despliegue con la plantilla: el contenedor de siempre lo levantó otro stack (antes de la plantilla).
# Se detiene y se renombra a <contenedor>-anterior para liberar el nombre, sin reinicio automático. Los datos no
# se tocan: el compose nuevo monta los mismos. Volver a mano: docker compose down && docker start <contenedor>-anterior
if docker container inspect "${CONTENEDOR:?}" >/dev/null 2>&1; then
  dir=$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' "$CONTENEDOR")
  if [[ "$dir" != "$PWD" ]]; then
    echo "Adoptando $CONTENEDOR (lo levantaba ${dir:-otro stack}); queda detenido como $CONTENEDOR-anterior."
    docker update --restart=no "$CONTENEDOR" >/dev/null
    docker stop "$CONTENEDOR" >/dev/null
    docker rm "$CONTENEDOR-anterior" >/dev/null 2>&1 || true
    docker rename "$CONTENEDOR" "$CONTENEDOR-anterior"
  fi
fi
