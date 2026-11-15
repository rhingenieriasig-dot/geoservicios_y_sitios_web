**Capítulo 4: Instalación y Configuración de GeoServer**

### **Servicios Soportados**

| Servicio | Descripción |
| ----- | ----- |
| **WMS** | Web Map Service \- Mapas como imágenes |
| **WFS** | Web Feature Service \- Datos vectoriales |
| **WCS** | Web Coverage Service \- Datos ráster |
| **WPS** | Web Processing Service \- Geoprocesamiento |
| **WMTS** | Web Map Tile Service \- Mapas en teselas |

 

## **Ejercicio Práctico**

1\.      Levanta GeoServer con `docker compose up -d` y verifica con `docker compose ps`

**Paso 1: Iniciar el servicio de GeoServer en Ubuntu**

Para el caso, en mi equipo se trabaja con Ubunto ya que por la vesión de Windows 10 no me fue posible trabajar con Docker:

![][image1]

Se abre una terminal y se inicia a través de:  *sudo dockerd*

En otra terminal se ejecuta lo siguiente:

![][image2]

Se hace de esta manera ya que en dicha ruta se habían instalado los programas necesarios, para el caso el Geo Server de manera nativa.

**Paso 2: Observa el arranque con docker compose logs \-f geoserver**

No se realiza por lo que se utiliza en Ubuntu

**Paso 3: Accede a la interfaz en [http\://localhost:8080/geoserver](http://localhost:8080/geoserver)**

**![][image3]** 

**Paso 4: Cambia la contraseña del usuario admin**

![][image4] 

 

**Paso 5: Explora las capas de demostración en Layer Preview**

![][image5]

**URL:**

[http\://localhost:8080/geoserver/ne/wms?service=WMS\&version=1.1.0\&request=GetMap\&layers=ne%3Aworld\&bbox=-180.0%2C-90.0%2C180.0%2C90.0\&width=768\&height=384\&srs=EPSG%3A4326\&styles=\&format=application/openlayers](http://localhost:8080/geoserver/ne/wms?service=WMS&version=1.1.0&request=GetMap&layers=ne%3Aworld&bbox=-180.0%2C-90.0%2C180.0%2C90.0&width=768&height=384&srs=EPSG%3A4326&styles=&format=application/openlayers)

 ![][image6]

**Paso 6:  Visualiza la capa sf:states en OpenLayers**

**![][image7]**

URL: [http\://localhost:8080/geoserver/topp/wms?service=WMS\&version=1.1.0\&request=GetMap\&layers=topp%3Astates\&bbox=-124.73142200000001%2C24.955967%2C-66.969849%2C49.371735\&width=768\&height=330\&srs=EPSG%3A4326\&styles=\&format=text%2Fhtml%3B%20subtype%3Dopenlayers](http://localhost:8080/geoserver/topp/wms?service=WMS&version=1.1.0&request=GetMap&layers=topp%3Astates&bbox=-124.73142200000001%2C24.955967%2C-66.969849%2C49.371735&width=768&height=330&srs=EPSG%3A4326&styles=&format=text%2Fhtml%3B%20subtype%3Dopenlayers)

![][image8]

![][image9]

**Paso 7:  Inspecciona el data\_dir con docker exec \-it curso\_geoserver ls /opt/geoserver\_data**

Para el caso se utilizó en Ubuntu, el siguiente código:

ls \-la /mnt/d/MAESTRIA\_SIG/WEB\_SITES/curso-sig/tools/geoserver/data\_dir

![][image10]

El resultado muestra la estructura completa del directorio de datos (`data_dir`) de GeoServer (`workspaces`, `styles`, `security`, `logs`, `global.xml`, etc.), lo cual confirma que el sistema reconoce y apunta de forma correcta a la carpeta de configuración local montada desde la ruta nativa en el disco en Windows.

**Paso 8:  Verifica el estado del servidor**

En la barra superior de herramientas **→ Settings → Estado del servidor** se comprobó la información visible del servidor:

![][image11]

Igualmente se verifica su estado en el navedagor:

![][image12]

[image1]: img/img_01.png
[image2]: img/img_02.png
[image3]: img/img_03.png
[image4]: img/img_04.png
[image5]: img/img_05.png
[image6]: img/img_06.png
[image7]: img/img_07.png
[image8]: img/img_08.png
[image9]: img/img_09.png
[image10]: img/img_10.png
[image11]: img/img_11.png
[image12]: img/img_12.png