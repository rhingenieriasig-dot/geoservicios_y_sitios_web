import os

def renombrar_secuencialmente(ruta_carpeta, prefijo="Capitulo_1_imagen"):
    if not os.path.exists(ruta_carpeta):
        print(f"❌ La ruta no existe: {ruta_carpeta}")
        return

    print(f"📂 Procesando carpeta: {ruta_carpeta}\n")
    
    # 1. Obtener todos los archivos de la carpeta
    archivos = os.listdir(ruta_carpeta)
    
    # 2. Filtrar únicamente las imágenes (puedes ajustar las extensiones si es necesario)
    extensiones_validas = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')
    imagenes = [f for f in archivos if f.lower().endswith(extensiones_validas)]
    
    # Ordenar los archivos alfabéticamente para mantener un orden lógico
    imagenes.sort()
    
    contador = 1
    
    # 3. Primer ciclo: Renombrar a un nombre temporal único para evitar conflictos de sobreescritura
    for i, archivo in enumerate(imagenes):
        ruta_antigua = os.path.join(ruta_carpeta, archivo)
        extension = os.path.splitext(archivo)[1].lower()
        
        # Generar el nuevo nombre secuencial con 3 dígitos (ej: 001, 002...)
        nuevo_nombre = f"{prefijo}_{contador:03d}{extension}"
        ruta_nueva = os.path.join(ruta_carpeta, nuevo_nombre)
        
        if ruta_antigua != ruta_nueva:
            if os.path.exists(ruta_nueva):
                print(f"⚠️ Advertencia: El archivo '{nuevo_nombre}' ya existe. Se omitirá.")
            else:
                os.rename(ruta_antigua, ruta_nueva)
                print(f"✔️ '{archivo}' ➔ '{nuevo_nombre}'")
                contador += 1

    print(f"\n✨ ¡Proceso completado! Se renombraron {contador - 1} imágenes de forma secuencial.")

if __name__ == "__main__":
    # Ruta exacta de tu carpeta de imágenes
    ruta_img = r"D:\MAESTRIA_SIG\WEB_SITES\curso_sig_2\geoservicios_y_sitios_web\Evidencias\Capitulo_1\img"
    renombrar_secuencialmente(ruta_img, prefijo="Capitulo_1_imagen")