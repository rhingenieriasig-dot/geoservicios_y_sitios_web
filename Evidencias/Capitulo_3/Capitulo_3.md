**Capítulo 3: Instalación de PostgreSQL y PostGIS**

Para el caso, en mi equipo se trabaja con Ubunto ya que por la vesión de Windows 10 no me fue posible trabajar con Dockerd:

Se abre una terminal y se inicia a través de:  *sudo dockerd*

![][image1]

En otra terminal se ejecuta lo siguiente:

sudo service postgresql start  
sudo service postgresql status  
sudo \-i \-u postgres  
psql \-d geodatos \-c "SELECT postgis\_version();"  
   
 ![][image2]

 

### **Paso 1: Conectarte a la base de datos interactiva**

Como estamos trabajando de forma nativa en Ubuntu, se inicia la sesión interactiva de PostgreSQL ejecutando en la terminal (seguir como usuario postgres o con sudo \-u postgres):

psql \-d geodatos

![][image3]

Paso 2: Crear la tabla de ciudades y configurar geometrías

SQL

CREATE TABLE ciudades (

```
	id SERIAL
```

```
	nombre
```

```
	poblacion
```

```
	geom GEOMETRY(POINT,
```

```
);
```

![][image4]

### **Paso 3: Insertar los datos espaciales de prueba**

Ahora insertemos algunas ciudades representativas de Colombia con sus respectivas coordenadas de longitud y latitud:

SQL  
INSERT INTO ciudades (nombre, poblacion, geom) VALUES  
	('Bogotá', 7181469, ST\_SetSRID(ST\_MakePoint(-74.0721, 4.7110), 4326)),  
	('Medellín', 2508452, ST\_SetSRID(ST\_MakePoint(-75.5636, 6.2442), 4326)),  
	('Cali', 2227642, ST\_SetSRID(ST\_MakePoint(-76.5225, 3.4516), 4326)),  
    ('Barranquilla', 1232766, ST\_SetSRID(ST\_MakePoint(-74.7813, 10.9685), 4326)),  
	('Cartagena', 1028736, ST\_SetSRID(ST\_MakePoint(-75.5144, 10.3910), 4326));  
**RETURNING id, nombre, poblacion, ST\_AsText(geom) AS geom\_wkt;**   
   
 ![][image5]  
 

### **Paso 4: Ejecutar consultas espaciales en PostGIS**

####  

#### **1\. Calcular la distancia entre todas las ciudades**

Se ejecuta la siguiente consulta para medir la distancia real sobre el elipsoide terrestre convirtiendo la geometría a tipo geography:

SQL  
   
SELECT  
	c1.nombre AS ciudad\_origen,  
	c2.nombre AS ciudad\_destino,  
	ROUND(ST\_Distance(c1.geom::geography, c2.geom::geography)::numeric / 1000, 2\) AS distancia\_km  
FROM ciudades c1  
CROSS JOIN ciudades c2  
WHERE c1.nombre \!= c2.nombre  
ORDER BY c1.nombre, distancia\_km;

![][image6] 

#### **2\. Crear un buffer (Área de influencia) de 100 km alrededor de Bogotá**

PostGIS  permite generar geometrías de área a partir de puntos:

SQL  
SELECT  
	nombre,  
	ST\_AsText(ST\_Buffer(geom::geography, 100000)::geometry) AS buffer\_wkt  
FROM ciudades  
WHERE nombre \= 'Bogotá';  
![][image7]  
![][image8]   
   
 

Es totalmente normal que al usar `ST_AsText()` la consola devuelva el bloque gigante de coordenadas, ya que WKT (*Well-Known Text*) imprime cada vértice del polígono del buffer.

Para evitar eso y obtener un resultado **resumido y métrico** (nombre, tipo de geometría, SRID y área en kilómetros cuadrados), utilizar funciones específicas de PostGIS como `ST_GeometryType()`, `ST_SRID()` y `ST_Area()`.

SQL  
SELECT  
	nombre AS ciudad\_favorita,  
	ST\_GeometryType(ST\_Buffer(geom::geography, 200000)::geometry) AS tipo\_geometria,  
	ST\_SRID(ST\_Buffer(geom::geography, 200000)::geometry) AS srid,  
	ROUND((ST\_Area(ST\_Buffer(geom::geography, 200000)) / 1000000)::numeric, 2\) AS area\_km2  
FROM ciudades  
WHERE nombre \= 'Bogotá';  
   
![][image9] 

### **Paso 5: Optimizar el rendimiento con un Índice Espacial (GiST)**

Para finalizar la práctica de este capítulo, crearemos un índice espacial del tipo **GiST** (*Generalized Search Tree*), que es fundamental en bases de datos geográficas para acelerar las consultas sobre grandes volúmenes de datos:

Para verificar que el índice se creó correctamente sobre la tabla, se ejecuta el comando meta de psql:  
   
SQL  
\\d ciudades  
  ![][image10]  
   
   
Comprobamos el estado de las extensiones espaciales instaladas:

![][image11]  
Ahora elaboramos una consulta:  
   
SQL  
SELECT  
	\-- 1\. Total de ciudades registradas en la tabla  
	(SELECT COUNT(\*) FROM ciudades) AS total\_ciudades,     
	\-- 2\. Población total consolidada de las ciudades analizadas  
	(SELECT SUM(poblacion) FROM ciudades) AS poblacion\_total\_pais,     
	\-- 3\. Conteo de geometrías de tipo Point (ciudades)  
	(SELECT COUNT(\*) FROM ciudades WHERE ST\_GeometryType(geom) \= 'ST\_Point') AS total\_puntos\_geograficos,	  
	\-- 4\. Verificación del Buffer de 200 km (Área resultante en km2 para Bogotá)  
	(SELECT ROUND((ST\_Area(ST\_Buffer(geom::geography, 200000)) / 1000000)::numeric, 2\)  
 	FROM ciudades WHERE nombre \= 'Bogotá') AS area\_buffer\_bogota\_km2,	  
	\-- 5\. Subconsulta de control: Verificar si el Índice Espacial GiST está activo (1 si existe, 0 si no)  
	(SELECT COUNT(\*)  
 	FROM pg\_indexes  
 	WHERE tablename \= 'ciudades' AND indexdef LIKE '%gist%') AS indice\_espacial\_activo;  
   
**![][image12]**

[image1]: img/Imagen_0001.png
[image2]: img/Imagen_0002.png
[image3]: img/Imagen_0003.png
[image4]: img/Imagen_0004.png
[image5]: img/Imagen_0005.png
[image6]: img/Imagen_0006.png
[image7]: img/Imagen_0007.png
[image8]: img/Imagen_0008.png
[image9]: img/Imagen_0009.png
[image10]: img/Imagen_0010.png
[image11]: img/Imagen_0011.png
[image12]: img/Imagen_0012.png