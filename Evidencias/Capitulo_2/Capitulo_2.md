**Capítulo 2: Explorar y consumir servicios OGC existentes**

**Taller práctico — consumir antes de publicar.** Antes de instalar PostgreSQL o GeoServer, vas a *usar* servicios web geográficos que ya existen en internet. Así entiendes qué es realmente un geoservicio y qué operaciones ofrece, para que cuando publiques los tuyos (capítulos 5 y 8\) sepas exactamente qué estás construyendo.

**Objetivos del Capítulo**

* Entender qué es un servicio web geográfico **consumiéndolo**, sin instalar nada.  
* Practicar las operaciones básicas de **WMS**, **WFS** y **WMTS** contra servicios públicos reales de Colombia.  
* Leer un GetCapabilities y construir peticiones a mano (GetMap, GetFeature, GetTile).  
* Consumir los mismos servicios desde el **navegador**, **QGIS** y la **línea de comandos** (curl / Python).

## **Requisitos**

Solo necesitas un **navegador**, **QGIS** y, opcionalmente, `curl` o Python. **No** se instala ningún servidor en este capítulo.  
 

## **2.3 WMS — Web Map Service (mapas como imágenes)**

El WMS devuelve **imágenes** de mapas renderizados en el servidor.

### **GetCapabilities — leer el menú**

[https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WMSServer?service=WMS\&request=GetCapabilities](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer?service=WMS&request=GetCapabilities)

 

 

En el XML busca:

·        \<Layer\> — las **capas** disponibles. En este servicio del DANE son niveles administrativos numerados **por detalle**: 0 \= **Manzana** (la más detallada) … 7 \= **Municipio**, 8 \= **Departamento**, 9 \= **País**. Anota el \<Name\> de la que quieras dibujar.

**Layer**

**![][image1]**

 

Este servicio en particular del Marco Geoestadístico Nacional (MGN 2024\) actúa como un contenedor jerárquico extenso que agrupa las divisiones político-administrativas del país. Las subcapas (\<Layer queryable="1"\>) aparecen organizadas por niveles (Name: (Pais=9, Departamento=8, Municipio=7, Zona Urbana=6, Clase=5, Sector Rural=4, Sección Rural=3, Sector Urbano=2, Sección urbana=1, Manzana= 0). **10 CAPAS (0 la mas detallada y 9 la mas general)**

 \<CRS\> / \<SRS\> — los **sistemas de coordenadas** soportados (p. ej. EPSG:4326).

Soporta múltiples sistemas de referencia de coordenadas, destacando principalmente **EPSG:4326** (WGS 84 geográficas) además de otros globales como EPSG:3857

CRS:84  
EPSG:4326  
EPSG:3857  
EPSG:102100

![][image2] 

 \<Format\> — los **formatos** de salida (image/png, image/jpeg).

Soporta varios formatos de salida:

![][image3]

image/**bmp**, image/**jpeg,** image/**tiff**, image/**png,** image/png8, image/png24, image/png32, image/**gif**  
image/svg+xml  
   
\<Style\> — los estilos disponibles.

![][image4]

**El estándar del DANE:** En este servicio en particular, el DANE no ha creado múltiples estilos visuales personalizados (por ejemplo, un estilo rojo, uno azul, uno punteado) para sus capas. Por eso, para todas las capas, el nombre técnico del estilo es simplemente **`default`** (por defecto).

### 

### **GetMap — pedir una imagen**

Con el nombre de capa que leíste, construye la URL a mano (WMS 1.1.1, `bbox = minx,miny,maxx,maxy` en lon/lat):

 [https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WMSServer?service=WMS\&version=1.1.1\&request=GetMap\&layers=8\&styles=\&srs=EPSG:4326\&bbox=-75.8,4.3,-70.8,7.5\&width=1280\&height=720\&format=image/png](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer?service=WMS&version=1.1.1&request=GetMap&layers=8&styles=&srs=EPSG:4326&bbox=-75.8,4.3,-70.8,7.5&width=1280&height=720&format=image/png)

pégala en el navegador: deberías ver la imagen. Cambia el `bbox`, el `width/height` o el `format` y observa el efecto.

![][image5]

1\. Cambio en el **`bbox`** (Zoom focalizado en Boyacá y centro oriente)  
**Objetivo:** Acercar la vista para dejar de ver tantos departamentos vecinos y concentrarnos únicamente en Boyacá y sus inmediaciones más cercanas.  
   
**URL modificada:**   
[https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WMSServer?service=WMS\&version=1.1.1\&request=GetMap\&layers=8\&styles=\&srs=EPSG:4326\&bbox=-74.5,5.1,-72.0,6.9\&width=1280\&height=720\&format=image/png](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer?service=WMS&version=1.1.1&request=GetMap&layers=8&styles=&srs=EPSG:4326&bbox=-74.5,5.1,-72.0,6.9&width=1280&height=720&format=image/png)

**Qué sucede al verla:** Al estrechar la caja delimitadora (pasando de un rango de `-75.8` a `-70.8` a un rango de `-74.5` a `-72.0`), el servidor hace un recorte geográfico más pequeño, por lo que el departamento de Boyacá se ve mucho más grande y detallado en la pantalla del navegador

 ![][image6]

2\. Cambio en el `width` y `height` (Modificar la resolución a formato cuadrado)  
**Objetivo:** Ver cómo reacciona el servidor ante proporciones de píxeles distintas a la panorámica HD (`1280x720`).  
   
**URL modificada:**  
[https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WMSServer?service=WMS\&version=1.1.1\&request=GetMap\&layers=8\&styles=\&srs=EPSG:4326\&bbox=-75.8,4.3,-70.8,7.5\&width=800\&height=800\&format=image/png](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer?service=WMS&version=1.1.1&request=GetMap&layers=8&styles=&srs=EPSG:4326&bbox=-75.8,4.3,-70.8,7.5&width=800&height=800&format=image/png)  
   
 **Qué sucede al verla:** Cambiamos los valores a `width=800` y `height=800`. Al ser una resolución simétrica (cuadrada), se notará que la imagen del mapa se reescala para ajustarse perfectamente a un lienzo cuadrado, cambiando la proporción visual de los espacios colindantes.

![][image7]

3\. Cambio en el `format` (Pasar de PNG a JPEG)  
**Objetivo:** Evaluar el cambio de formato de imagen y el comportamiento del fondo.  
   
**URL modificada:**  
[https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WMSServer?service=WMS\&version=1.1.1\&request=GetMap\&layers=8\&styles=\&srs=EPSG:4326\&bbox=-75.8,4.3,-70.8,7.5\&width=1280\&height=720\&format=image/jpeg](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer?service=WMS&version=1.1.1&request=GetMap&layers=8&styles=&srs=EPSG:4326&bbox=-75.8,4.3,-70.8,7.5&width=1280&height=720&format=image/jpeg)

**Qué sucede al verla:** En lugar de `image/png` (que admite transparencias), usamos `image/jpeg`. Visualmente se observa que las zonas exteriores o el fondo que antes podían ser transparentes ahora se renderizan con un fondo de color sólido (generalmente blanco por defecto que asigna el servidor).

![][image8]

También podemos modificar el color de fondo del mapa:

**URL modificada:**  
[https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WMSServer?service=WMS\&version=1.1.1\&request=GetMap\&layers=8\&styles=\&srs=EPSG:4326\&bbox=-74.5,5.1,-72.0,6.9\&width=1280\&height=720\&format=image/png&**bgcolor=0xCCCCCC\&transparent=false**](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer?service=WMS&version=1.1.1&request=GetMap&layers=8&styles=&srs=EPSG:4326&bbox=-74.5,5.1,-72.0,6.9&width=1280&height=720&format=image/png&bgcolor=0xCCCCCC&transparent=false)

![][image9]

### **GetFeatureInfo — consultar un punto**

Parte de la misma petición `GetMap` (incluido `styles=`) y añade `request=GetFeatureInfo`, `query_layers`, `info_format=text/html` y la posición del píxel (`x`,`y` o `i`,`j`) para obtener los atributos del objeto bajo ese punto.  
 

### **Estructura de la URL para `GetFeatureInfo`**

Tomando como base tu URL de `GetMap`, se cambia y agregar los siguientes parámetros clave:

`request=GetFeatureInfo` (en lugar de `GetMap`).  
`query_layers=8` (indica la capa específica sobre la cual se realizará la consulta de atributos).  
`info_format=text/html` (formato en el que el servidor devolverá la respuesta, ideal para visualizarla directamente como una tabla web o HTML).  
`x=640` e `y=360` (coordenadas del píxel dentro de tu lienzo de `1280x720`, por ejemplo, justo en el centro exacto de la imagen).  
   
**URL modificada:**  
[https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WMSServer?service=WMS\&version=1.1.1\&request=GetFeatureInfo\&layers=8&query\_layers=8\&styles=\&srs=EPSG:4326\&bbox=-74.3,4.6,-72.0,6.4\&width=1280\&height=720\&format=image/png&x=640&y=360&info\_format=text/html](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=8&query_layers=8&styles=&srs=EPSG:4326&bbox=-74.3,4.6,-72.0,6.4&width=1280&height=720&format=image/png&x=640&y=360&info_format=text/html)

 ![][image10]

### **En QGIS**

*Capa → Agregar capa → WMS/WMTS → Nueva* → pega la URL base (sin parámetros). QGIS lee el `GetCapabilities`, lista las capas y las dibuja. Es el mismo WMS, ahora desde un cliente de escritorio.

![][image11]

![][image12]

![][image13]

![][image14]

 **2.4 WFS — Web Feature Service (datos vectoriales)**

El WFS devuelve **geometrías y atributos** (no imágenes): puedes descargarlos y analizarlos.

Punto de entrada WFS del DANE:

[https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WFSServer?service=WFS\&request=GetCapabilities](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WFSServer?service=WFS&request=GetCapabilities)

### **Las tres operaciones**

\# 1\) Menú del servicio \-\> lista los typeNames (capas), p. ej.  
\#    Serv\_CapasMGN\_2024:Departamento , Serv\_CapasMGN\_2024:Municipio  
.../WFSServer?service=WFS\&version=2.0.0\&request=GetCapabilities  
 

[https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer//WFSServer?service=WFS\&version=2.0.0\&request=GetCapabilities](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetCapabilities)

**Qué se verá en la respuesta:** Al abrir la URL en el navegador, el servidor descargará o renderizará un archivo XML masivo. Dentro de ese documento, se buscan las etiquetas llamadas **`<FeatureType>`** y, dentro de ellas, las etiquetas **`<Name>`**. Ahí ese enccontrarán los identificadores exactos (por ejemplo, `Serv_CapasMGN_2024:Departamento`, `Serv_CapasMGN_2024:Municipio`, etc.) que son obligatorios para hacer peticiones de descarga de geometría (`GetFeature`).

![][image15]

Dado que revisar archivos XML de capacidades visualmente en el navegador puede ser tedioso, se puede utilizar la lógica de Python para extraer y listar automáticamente todos los `typeNames` limpios en la consola:  (se generó un nuevo archivo en la carpeta correspondiente a través de la consola de Visual Studio denominada:  listar\_wfs.py, se pega dentro de la misma el código de Python y luego se ejecuta)

![][image16]

```
 
```

```
# 2) Esquema de una capa (campos y tipos)
```

```
.../WFSServer?service=WFS&version=2.0.0&request=DescribeFeatureType&typeNames=Serv_CapasMGN_2024:Departamento
```

   
[https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WFSServer?service=WFS\&version=2.0.0\&request=DescribeFeatureType\&typeNames=Serv\_CapasMGN\_2024:Departamento](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WFSServer?service=WFS&version=2.0.0&request=DescribeFeatureType&typeNames=Serv_CapasMGN_2024:Departamento)

**Qué se verá:** Un documento XML estructurado (en formato XSD) que enumera cada campo asociado a la capa (como `DPTO_CCDGO`, `DPTO_CNMBR`, áreas, perímetros) junto con el tipo de datos informático que soporta cada uno.

![][image17]

Para evitar leer código XML crudo en la pantalla y extraer de forma limpia los nombres de los atributos y sus tipos de datos, se generó un archivo nuevo ( `describir_wfs.py)`

![][image18]

```
 
```

```
# 3) Descargar 5 features en GeoJSON
```

```
.../WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeNames=Serv_CapasMGN_2024:Departamento&count=5&outputFormat=GEOJSON
```

 

[https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WFSServer?service=WFS\&version=2.0.0\&request=GetFeature\&typeNames=Serv\_CapasMGN\_2024:Departamento\&count=5\&outputFormat=GEOJSON](https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeNames=Serv_CapasMGN_2024:Departamento&count=5&outputFormat=GEOJSON)

El navegador descargará o mostrará directamente una estructura JSON masiva que contiene un objeto de tipo `FeatureCollection`, con las coordenadas geográficas reales de los primeros 5 departamentos y sus respectivas propiedades tabulares.

![][image19]

Para almacenar este resultado directamente en la carpeta de trabajo (`curso_sig_2`) y poder abrirlo luego en QGIS o inspectores de código, se crea un script automatizado.

![][image20]

![][image21]

También podemos elaborar la consulta gráfica del archivo geojson a través de [https\://geojson.io/](https://geojson.io/)

Pegando el archivo en su interfaz:

 ![][image22]

 

Al Verificar el archivo que se descargó en QGIS tenemos:

![][image23]

### **Desde la línea de comandos y Python**

\# Guardar la respuesta en un archivo (base del WFS del DANE)  
curl.exe \-s 'https\://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv\_CapasMGN\_2024/MapServer/WFSServer?service=WFS\&version=2.0.0\&request=GetFeature\&typeNames=Serv\_CapasMGN\_2024:Departamento\&count=5\&outputFormat=GEOJSON' \-o departamentos.geojson

![][image24]

![][image25]

### **Contraste: FeatureServer REST (IDE Boyacá)**

Mientras que OGC WFS utiliza parámetros estandarizados basados en XML (?service=WFS\&request=GetFeature\&version=2.0.0), ArcGIS REST Server organiza las consultas a través de rutas jerárquicas de URL y parámetros orientados a bases de datos relacionales (where, outFields, f=geojson).

 

[https\://services6.arcgis.com/Ex2fmFOuTOHRZtML/ArcGIS/rest/services/Veredas\_Boyaca\_2024/FeatureServer/0/query?where=1=1\&outFields=NOMB\_MPIO,NOMBRE\_VER\&resultRecordCount=5\&f=geojson](https://services6.arcgis.com/Ex2fmFOuTOHRZtML/ArcGIS/rest/services/Veredas_Boyaca_2024/FeatureServer/0/query?where=1=1&outFields=NOMB_MPIO,NOMBRE_VER&resultRecordCount=5&f=geojson)

cada segmento tiene un significado técnico muy claro:

1\.     **`/FeatureServer/0/`**: El número `0` al final de la ruta indica la **capa o sub-dataset** específica dentro del servicio (en este caso, la capa de veredas). Si fuera otra capa, cambiaría a `1`, `2`, etc.

2\.     **`/query`**: Es el equivalente al `GetFeature` de WFS; le indica al servidor que ejecute una consulta espacial y/o alfanumérica.

3\.     **`where=1=1`**: Es la cláusula SQL de filtrado. `1=1` significa *"tráeme todo sin restricciones"*, pero aquí se podría cambiar fácilmente por un filtro de municipio, por ejemplo: `where=NOMB_MPIO='SOGAMOSO'`.

4\.     **`outFields=NOMB_MPIO,NOMBRE_VER`**: Especifica los campos o columnas exactas que se quieren traer (equivalente a seleccionar columnas en una base de datos), evitando descargar atributos innecesarios.

5\.     **`resultRecordCount=5`**: Funciona exactamente igual que el `count=5` del WFS; limita la respuesta a los primeros 5 registros.

6\.     **`f=geojson`**: El parámetro de formato de salida (`f` de *format*), que le pide

 ![][image26]

A manera de ejemplo:

python \-c "import requests; open('veredas\_boyaca.geojson', 'wb').write(requests.get('https\://services6.arcgis.com/Ex2fmFOuTOHRZtML/ArcGIS/rest/services/Veredas\_Boyaca\_2024/FeatureServer/0/query?where=1=1\&outFields=NOMB\_MPIO,NOMBRE\_VER\&resultRecordCount=5\&f=geojson').content); print('¡Veredas descargadas con éxito desde el FeatureServer\!')"

![][image27]

QGIS

![][image28]

## **2.5 WMTS — Web Map Tile Service (teselas)**

[https\://tile.openstreetmap.org/7/38/60.png](https://tile.openstreetmap.org/7/38/60.png)

![][image29] 

[https\://tile.openstreetmap.org/8/76/120.png](https://tile.openstreetmap.org/8/76/120.png)

![][image30]

[image1]: img/Capítulo%202_Página_02_Imagen_0001.png
[image2]: img/Capítulo%202_Página_02_Imagen_0002.png
[image3]: img/Capítulo%202_Página_03_Imagen_0001.png
[image4]: img/Capítulo%202_Página_03_Imagen_0002.png
[image5]: img/Capítulo%202_Página_04_Imagen_0001.png
[image6]: img/Capítulo%202_Página_04_Imagen_0002.png
[image7]: img/Capítulo%202_Página_05_Imagen_0001.png
[image8]: img/Capítulo%202_Página_05_Imagen_0002.png
[image9]: img/Capítulo%202_Página_06_Imagen_0001.png
[image10]: img/Capítulo%202_Página_07_Imagen_0001.png
[image11]: img/Capítulo%202_Página_07_Imagen_0002.png
[image12]: img/Capítulo%202_Página_08_Imagen_0001.png
[image13]: img/Capítulo%202_Página_08_Imagen_0002.png
[image14]: img/Capítulo%202_Página_08_Imagen_0003.png
[image15]: img/Capítulo%202_Página_09_Imagen_0001.png
[image16]: img/Capítulo%202_Página_10_Imagen_0001.png
[image17]: img/Capítulo%202_Página_10_Imagen_0002.png
[image18]: img/Capítulo%202_Página_11_Imagen_0001.png
[image19]: img/Capítulo%202_Página_11_Imagen_0002.png
[image20]: img/Capítulo%202_Página_12_Imagen_0001.png
[image21]: img/Capítulo%202_Página_12_Imagen_0002.png
[image22]: img/Capítulo%202_Página_12_Imagen_0003.png
[image23]: img/Capítulo%202_Página_13_Imagen_0001.png
[image24]: img/Capítulo%202_Página_13_Imagen_0002.png
[image25]: img/Capítulo%202_Página_13_Imagen_0003.png
[image26]: img/Capítulo%202_Página_14_Imagen_0001.png
[image27]: img/Capítulo%202_Página_15_Imagen_0001.png
[image28]: img/Capítulo%202_Página_15_Imagen_0002.png
[image29]: img/Capítulo%202_Página_15_Imagen_0003.png
[image30]: img/Capítulo%202_Página_16_Imagen_0001.png
