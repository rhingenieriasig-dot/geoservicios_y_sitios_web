**Capítulo 7: Carga de Datos a PostgreSQL**

Primero se activa el servicio de postgres a través de la terminal de Ubuntu:

![Activación del servicio PostgreSQL](img/01.png)

**1. Carga los shapefiles de departamentos y municipios usando shp2pgsql**

![Carga shapefile departamentos con shp2pgsql](img/02.png)

Ahora realizamos lo mismo para la capa de municipios:

![Carga shapefile municipios con shp2pgsql](img/03.png)

**2. Verifica que los datos se cargaron correctamente**

![Verificación de tablas cargadas en PostgreSQL](img/04.png)

Verificamos la estructura de la capa de Departamentos:

![Estructura tabla departamentos parte 1](img/05.png)

![Estructura tabla departamentos parte 2](img/06.png)

Verificamos la estructura de la capa de Municipios:

![Estructura tabla municipios parte 1](img/07.png)

![Estructura tabla municipios parte 2](img/08.png)

**3. Cuenta el número de registros en cada tabla**

![Conteo de registros por tabla](img/09.png)

**4. Verifica que todas las geometrías son válidas**

![Validación de geometrías](img/10.png)

**5. Crea índices espaciales si no existen**

Departamentos:

![Índices espaciales departamentos](img/11.png)

Municipios:

![Índices espaciales municipios](img/12.png)

Las capturas evidencian **0 geometrías inválidas y 0 nulas** en las dos tablas. Los índices espaciales ya estaban creados: `departamentos_geom_idx` y `municipios_geom_idx`, ambos de tipo **gist (`geom`)**. No fue necesario recrearlos ni ejecutar reparaciones.

**6. Calcula el área del departamento más grande**

![Cálculo área departamento más grande](img/13.png)

**7. Lista los 5 departamentos con más municipios**

![Top 5 departamentos con más municipios](img/14.png)

**8. Encuentra el municipio que contiene el punto [-74.0721, 4.7110] (Bogotá)**

![Consulta espacial punto Bogotá](img/15.png)

**9. Actualiza las estadísticas de las tablas**

![Actualización de estadísticas ANALYZE](img/16.png)

**10. Exporta los departamentos a GeoJSON**

Exportar a GeoJSON usando `ogr2ogr` (desde el host): Se presentaron problemas al tratar de hacer el procedimiento con este paso, ya que no fue posible validar la clave que solicitaba la consola para proceder con la instalación.

Por lo anterior se optó por la siguiente ruta:

### **Exportar directamente mediante SQL (Sin instalar herramientas adicionales)**

Para no instalar paquetes adicionales en este momento en Ubuntu, se procedió a ejecutar la exportación de manera nativa mediante una consulta SQL dentro de `psql`.

1. Entra a tu base de datos:

```bash
psql -d geodatos
```

2. Ejecuta la siguiente consulta para volcar la tabla departamentos a un archivo GeoJSON:

```sql
COPY (
    SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(feature)
    )
    FROM (
        SELECT jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', to_jsonb(row) - 'geom'
        ) AS feature
        FROM (SELECT * FROM departamentos) row
    ) features
) TO '/tmp/departamentos_export.geojson';
```

3. Sal de la consola de PostgreSQL escribiendo:

```sql
\q
```

4. Copia el archivo resultante desde la carpeta temporal hacia el directorio de tu proyecto en tu disco:

```bash
cp /tmp/departamentos_export.geojson /mnt/d/MAESTRIA_SIG/WEB_SITES/curso_sig_2/geoservicios_y_sitios_web/datos/departamentos_export.geojson
```

![Exportación a GeoJSON y copia al directorio del proyecto](img/17.png)

*Verification:* Se verifica que el archivo se copió correctamente listando el contenido de la carpeta de datos con:

```bash
ls -la /mnt/d/MAESTRIA_SIG/WEB_SITES/curso_sig_2/geoservicios_y_sitios_web/datos/
```

![Verificación de archivo GeoJSON exportado](img/18.png)

En QGIS, verificamos la capa recién creada denominada: **departamentos_export.geojson**

![Visualización de departamentos_export.geojson en QGIS](img/19.png)
