#!/bin/bash

# Directorios
SRC_DIR="docs/static/img/webp"
BACKUP_DIR="docs/static/img/webp/backup"
TEMP_DIR="/tmp/optimized-images"

# Crear directorios si no existen
mkdir -p "$BACKUP_DIR"
mkdir -p "$TEMP_DIR"

# Crear respaldo de las imágenes originales
cp "$SRC_DIR/foot-card-1.webp" "$BACKUP_DIR/foot-card-1-original-$(date +%Y%m%d).webp"
cp "$SRC_DIR/foot-card-2.webp" "$BACKUP_DIR/foot-card-2-original-$(date +%Y%m%d).webp"
cp "$SRC_DIR/foot-card-3.webp" "$BACKUP_DIR/foot-card-3-original-$(date +%Y%m%d).webp"

# Función para optimizar imágenes
optimize_image() {
    local input="$1"
    local output="$2"
    
    echo "Optimizando $input..."
    
    # Redimensionar a 200x200 manteniendo la relación de aspecto
    # y aplicar compresión WebP con calidad 85 (rango 1-100)
    convert "$input" \
        -resize 200x200^ \
        -gravity center \
        -extent 200x200 \
        -quality 85 \
        -strip \
        -define webp:method=6 \
        -define webp:pass=6 \
        -define webp:target-size=16384 \
        "$output"
    
    # Mostrar información del archivo optimizado
    local original_size=$(du -h "$input" | cut -f1)
    local optimized_size=$(du -h "$output" | cut -f1)
    echo "  Tamaño original: $original_size"
    echo "  Tamaño optimizado: $optimized_size"
    
    # Reemplazar la imagen original con la optimizada
    mv "$output" "$input"
}

# Optimizar cada imagen
optimize_image "$SRC_DIR/foot-card-1.webp" "$TEMP_DIR/foot-card-1-optimized.webp"
optimize_image "$SRC_DIR/foot-card-2.webp" "$TEMP_DIR/foot-card-2-optimized.webp"
optimize_image "$SRC_DIR/foot-card-3.webp" "$TEMP_DIR/foot-card-3-optimized.webp"

echo "¡Optimización completada! Se crearon copias de seguridad en $BACKUP_DIR"
