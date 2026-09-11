#!/usr/bin/env bash
# Descarga las imágenes que aún vienen del CDN de Squarespace (logo,
# hero y galería del index) y actualiza los HTML a rutas locales.
# Correrlo UNA VEZ desde la raíz del repo:  bash descargar-imagenes-squarespace.sh
# Importante hacerlo antes de cancelar la suscripción de Squarespace,
# porque esas imágenes viven en el CDN de ellos.
set -e
mkdir -p images/sq
BASE="https://images.squarespace-cdn.com/content/v1/531d3bd6e4b0ddc80ccfca51"

declare -A MAPA=(
  ["$BASE/90736c36-22ac-4cdb-b52f-da504f413702/GreenCRARC_2020-Logofinal.png"]="images/sq/logo.png"
  ["$BASE/0b09773f-8cdd-47a3-a2c3-6864eb2782ec/20220904_075900.jpg"]="images/sq/centro.jpg"
  ["$BASE/1615142307702-APJ87BNVD9E5FO9LO7R5/img-01.jpg"]="images/sq/img-01.jpg"
  ["$BASE/1615001490721-SHJEFRWXN4S51LOOFZAN/img-05.jpg"]="images/sq/img-05.jpg"
  ["$BASE/1615001755380-YQE0K8HOXEBNIM1J4AR3/img-08.jpg"]="images/sq/img-08.jpg"
  ["$BASE/1598633922604-9LBZE9ICCJYEYQVPY9FA/img-06.jpg"]="images/sq/img-06.jpg"
  ["$BASE/1598633978077-NZ9LUXBENH7F8W8AS3YP/img-03.jpg"]="images/sq/img-03.jpg"
  ["$BASE/1592430685614-82UHSNFQUVH82V3LZ6XE/img-04.jpg"]="images/sq/img-04.jpg"
  ["$BASE/1592418509910-163GRHIHN5APGAHD2ZVY/img-02.jpg"]="images/sq/img-02.jpg"
)

for url in "${!MAPA[@]}"; do
  destino="${MAPA[$url]}"
  echo "Descargando $destino ..."
  curl -sSL "$url" -o "$destino"
done

echo "Actualizando rutas en los HTML..."
for url in "${!MAPA[@]}"; do
  destino="${MAPA[$url]}"
  sed -i "s|$url|$destino|g" index.html conocenos.html
done

echo "Listo ✅  Revisá con: git diff — y luego commit."
