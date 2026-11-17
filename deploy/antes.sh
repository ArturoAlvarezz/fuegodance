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
# Se libera su nombre (queda detenido como <contenedor>-anterior, sin reinicio automático) y se crea el stack nuevo
# sin arrancarlo. Si eso falla, el contenedor de siempre vuelve tal como estaba y el despliegue se corta aquí.
# Los datos no se tocan: el compose nuevo monta los mismos.
# Volver a mano después: docker compose down && docker rename <c>-anterior <c> && docker start <c>
if docker container inspect "${CONTENEDOR:?}" >/dev/null 2>&1; then
  dir=$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' "$CONTENEDOR")
  if [[ "$dir" != "$PWD" ]]; then
    politica=$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' "$CONTENEDOR")
    echo "Adoptando $CONTENEDOR (lo levantaba ${dir:-otro stack}); queda detenido como $CONTENEDOR-anterior."
    docker update --restart=no "$CONTENEDOR" >/dev/null
    docker stop "$CONTENEDOR" >/dev/null
    docker rm "$CONTENEDOR-anterior" >/dev/null 2>&1 || true
    docker rename "$CONTENEDOR" "$CONTENEDOR-anterior"
    if ! docker compose up --no-start --remove-orphans; then
      echo "No se pudo crear el stack nuevo: vuelve $CONTENEDOR tal como estaba." >&2
      docker compose down >/dev/null 2>&1 || true
      docker rename "$CONTENEDOR-anterior" "$CONTENEDOR"
      docker update --restart="$politica" "$CONTENEDOR" >/dev/null
      docker start "$CONTENEDOR" >/dev/null
      exit 1
    fi
  fi
fi
