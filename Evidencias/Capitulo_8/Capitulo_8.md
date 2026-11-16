# **Capítulo 8: Publicación de Capas en GeoServer**

1. Crea el workspace `taller`. Para el caso, se cambió el nombre al espacio de trabajo por: **geoservicios**

![Creación de workspace geoservicios](img/01.png)

### **Workspace geoservicios registrado**

![Workspace geoservicios registrado](img/02.png)

2. Configura el store `geoservicios_postgis` conectado a tu base de datos

![Configuración del store geoservicios_postgis](img/03.png)

### **Store geoservicios_postgis habilitado**

![Store geoservicios_postgis habilitado](img/04.png)

![Capas disponibles en el store](img/05.png)

3. Publica la capa `departamentos`

![Publicación de la capa departamentos](img/06.png)

4. Publica la capa `municipios`

![Publicación de la capa municipios](img/07.png)

5. Sube y aplica los estilos SLD del repositorio

**Configurar Estilo: Departamentos**

Cargar estilo:

![Cargar estilo departamentos](img/08.png)

Validación:

![Validación estilo departamentos](img/09.png)

Salvar:

![Guardar estilo departamentos](img/10.png)

**Configurar Estilo: Municipios**

Cargar estilo:

![Cargar estilo municipios](img/11.png)

Validación:

![Validación estilo municipios](img/12.png)

Salvar:

![Guardar estilo municipios](img/13.png)

### **Asignar Estilos a Capas**

**Departamentos**

![Asignar estilo a departamentos](img/14.png)

**Municipios**

![Asignar estilo a municipios](img/15.png)

6. Visualiza las capas en Layer Preview

**Departamentos:**

Vista previa de departamentos con **estilo dorado**

![Vista previa departamentos](img/16.png)

**Municipios:**

Vista previa de municipios con estilo **amarillo pastel claro**

![Vista previa municipios](img/17.png)

7. Crea el layer group `colombia_admin`

![Configuración layer group parte 1](img/18.png)

![Configuración layer group parte 2](img/19.png)

![Layer group colombia_admin creado](img/20.png)

8. Prueba el servicio WMS con GetMap

Se prueba el servicio WMS en el navegador:

**Solo la capa de departamentos:**

URL:  `http://localhost:8080/geoserver/geoservicios/wms?service=WMS&version=1.1.0&request=GetMap&layers=geoservicios:departamentos&styles=&bbox=-79.0,-4.2,-66.8,13.4&width=800&height=600&srs=EPSG:4326&format=image/png`

![Resultado GetMap capa departamentos](img/21.png)

**El grupo de capas completo (`colombia_admin`):**

URL: `http://localhost:8080/geoserver/geoservicios/wms?service=WMS&version=1.1.0&request=GetMap&layers=geoservicios:colombia_admin&bbox=-79.0,-4.2,-66.8,13.4&width=800&height=600&srs=EPSG:4326&format=image/png`

![Resultado GetMap grupo colombia_admin](img/22.png)

En la imagen anterior, se alcanzan a distinguir los límites de los municipios debajo de la capa de departamentos.

9. Prueba el servicio WFS con GetFeature y filtro CQL

**Filtro CQL por departamento (Cundinamarca):**

URL: `http://localhost:8080/geoserver/geoservicios/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=geoservicios:departamentos&outputFormat=application/json&cql_filter=dpto_cnmbr='CUNDINAMARCA'`

Al colocar la URL en el navegador se despliega un archivo tipo GeoJSON que contiene la información del departamento de **Cundinamarca**:

![Respuesta GeoJSON Cundinamarca](img/23.png)

Comprobamos gráficamente en [https://geojson.io/](https://geojson.io/):

![Visualización Cundinamarca en geojson.io](img/24.png)

**Filtro CQL por departamento (Boyacá) o límite de registros en municipios:**

URL: `http://localhost:8080/geoserver/geoservicios/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=geoservicios:municipios&outputFormat=application/json&cql_filter=dpto_ccdgo='15'`

Al colocar la URL en el navegador se despliega un archivo tipo GeoJSON que contiene la información solicitada, para el caso los municipios de Boyacá:

![Respuesta GeoJSON municipios de Boyacá](img/25.png)

Comprobamos gráficamente en [https://geojson.io/](https://geojson.io/):

![Visualización municipios de Boyacá en geojson.io](img/26.png)

También se puede filtrar determinados municipios, por ejemplo los 5 más grandes por área:

URL: `http://localhost:8080/geoserver/geoservicios/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=geoservicios:municipios&outputFormat=application/json&cql_filter=dpto_ccdgo='15'&sortBy=shape_area+D&count=5`

![Respuesta GeoJSON 5 municipios más grandes de Boyacá](img/27.png)

Los municipios que aparecen en el listado son: **Puerto Boyacá**, **Cubará**, **Aquitania**, **Chiscas** y **Otanche** (los 5 municipios más extensos de Boyacá).

10. Habilita el caché para la capa de departamentos

![Configuración Tile Caching](img/28.png)

**Prueba en el demo de GeoServer:**

URL: `http://localhost:8080/geoserver/gwc/demo`

![Demo de GeoWebCache](img/29.png)

Se verifica el servicio a través de los enlaces que se observan de OpenLayers en la página, para la capa respectiva (`geoservicios:departamentos`):

* **PNG:**

![Vista previa caché PNG](img/30.png)

* **JPEG:**

![Vista previa caché JPEG](img/31.png)

**En el navegador:**

URL: `http://localhost:8080/geoserver/gwc/service/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=geoservicios:departamentos&STYLE=&TILEMATRIXSET=EPSG:4326&TILEMATRIX=EPSG:4326:5&TILEROW=10&TILECOL=18&FORMAT=image/png`

Si bien el ejercicio indica un zoom de 10 al configurar el caché, al consultar la URL en el navegador arroja un error:

![Error Out of Range en WMTS](img/32.png)

El mensaje `<ExceptionText>Row 10 is out of range, min: 13 max:16</ExceptionText>` significa que se está pidiendo una tesela ubicada fuera del *Bounding Box* (extensión geográfica) de Colombia para el nivel de zoom `EPSG:4326:5`:

* En la pirámide `EPSG:4326:5`, Colombia abarca únicamente las filas (`TILEROW`) comprendidas entre la **13 y la 16**.
* La fila `10` que se pidió en la URL de ejemplo cae en el hemisferio norte (alrededor de Norteamérica/Europa), donde la capa `geoservicios:departamentos` no tiene datos y GeoWebCache bloquea la petición por estar fuera de rango.

**¿Cómo corregirlo?**

Se cambia el parámetro `TILEROW=10` por un valor válido dentro del rango que indicó el mismo error (por ejemplo, `TILEROW=15`) y se ajusta `TILECOL` al rango longitudinal de Colombia (alrededor de **18 o 19**):

URL: `http://localhost:8080/geoserver/gwc/service/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=geoservicios:departamentos&STYLE=&TILEMATRIXSET=EPSG:4326&TILEMATRIX=EPSG:4326:5&TILEROW=15&TILECOL=18&FORMAT=image/png`

Tesela suroccidente de Colombia:

![Tesela WMTS correcta](img/33.png)

Estos cambios solo se elaboran en la URL, ya que GeoServer ya está bien configurado.