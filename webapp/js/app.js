// Crear el mapa centrado en el departamento de Boyacá (preferCanvas mejora el rendimiento con capas pesadas)
const map = L.map('map', {
    preferCanvas: true
}).setView([5.53, -73.35], 8);

// URL del servicio WMS de GeoServer
const geoserverUrl = 'https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer';

// Código DANE del departamento a mostrar: Boyacá
const BOYACA_CCDGO = '15';

// Agregar capa WMS de departamentos
// Nota: el servicio es un ArcGIS MapServer WMS y no admite filtros por atributo (CQL),
// por lo que se restringe la carga de teselas a la extensión de Boyacá mediante 'bounds'.
const departamentosWMS = L.tileLayer.wms(geoserverUrl, {
    layers: '8',
    format: 'image/png',
    transparent: true,
    attribution: 'DANE - Departamento Administrativo Nacional de Estadística'
}).addTo(map);

// URL del servicio WFS
const departamentosWFSUrl = 'datos/departamentos.geojson'; // Cambia esto a la URL de tu servicio WFS
let departamentosGeoJSON; // Variable para almacenar la capa GeoJSON

// Cargar y mostrar departamentos como GeoJSON
fetch(departamentosWFSUrl)
    .then(response => response.json())
    .then(data => {
        // Crear capa GeoJSON (solo Boyacá)
        departamentosGeoJSON = L.geoJSON(data, {
            filter: feature => feature.properties.dpto_ccdgo === BOYACA_CCDGO,
            style: {
                color: '#1b5e20',
                weight: 2.5,
                fillColor: '#e8f881',
                fillOpacity: 0.12
            },
            onEachFeature: onEachFeature
        });

        // Agregar al mapa
        departamentosGeoJSON.addTo(map);
        controlLayer.addOverlay(departamentosGeoJSON, "Departamentos (WFS)"); // Agregar al control de capas

        // Extensión de Boyacá
        const boyacaBounds = departamentosGeoJSON.getBounds();

        // Restringir las teselas de ambos WMS a la extensión de Boyacá
        departamentosWMS.options.bounds = boyacaBounds;
        departamentosWMS.redraw();
        municipiosWMS.options.bounds = boyacaBounds;

        // Centrar la vista en el departamento de Boyacá
        map.fitBounds(boyacaBounds);
    })
    .catch(error => console.error('Error cargando WFS:', error));

// Agregar capa WMS de municipios
const municipiosWMS = L.tileLayer.wms(geoserverUrl, {
    layers: '7',
    format: 'image/png',
    transparent: true,
    attribution: 'DANE - Departamento Administrativo Nacional de Estadística'
});

// Capas base
const baseMaps = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }),
    "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
    })
};

// Capas superpuestas
let overlayMaps = {
    "Departamentos": departamentosWMS,    
    "Municipios": municipiosWMS
};

// Agregar control de capas
const controlLayer = L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(map);

// Agregar capa base por defecto (sin duplicar la instancia inicial)
baseMaps["OpenStreetMap"].addTo(map);

// ============================================================
// Capas detalladas de Boyacá (cartografía base IGAC/DANE)
// Datos recortados por departamento en datos/15_BOYACA/.
// Se cargan de forma diferida (lazy): solo se descarga el GeoJSON
// cuando el usuario activa la capa en el control, porque algunas
// (Drenaje, Curvas de Nivel, Vías) pesan varios MB.
// ============================================================
// Nota: Verifica que la carpeta en GitHub se llame '15_BOYACA' (sin tilde) para evitar errores 404
const boyacaDataDir = 'datos/15_BOYACÁ/';
let toponimosLayer = null; // Referencia para el buscador de lugares

const capasBoyaca = [
    {
        file: 'Administrativo_P.geojson', label: 'Topónimos administrativos',
        tipo: 'punto', color: '#c62828', radio: 4
    },
    {
        file: 'Construccion_P.geojson', label: 'Construcciones',
        tipo: 'punto', color: '#6d4c41', radio: 3
    },
    {
        file: 'Via.geojson', label: 'Vías',
        tipo: 'linea', estilo: { color: '#e65100', weight: 1.5 }
    },
    {
        file: 'Drenaje_Sencillo.geojson', label: 'Drenaje sencillo',
        tipo: 'linea', estilo: { color: '#1e88e5', weight: 1 }
    },
    {
        file: 'Curva_Nivel.geojson', label: 'Curvas de nivel',
        tipo: 'linea', estilo: { color: '#8d6e63', weight: 0.8 }
    },
    {
        file: 'Bosque.geojson', label: 'Bosques',
        tipo: 'poligono', estilo: { color: '#1b5e20', weight: 1, fillColor: '#66bb6a', fillOpacity: 0.4 }
    }
];

// Construye el contenido del popup a partir de los atributos más relevantes
function popupBoyaca(props) {
    const campos = [
        ['NOMBRE_GEO', 'Nombre'],
        ['TIPO_VIA', 'Tipo de vía'],
        ['ESTADO_SUP', 'Estado superficie'],
        ['ESTADO_DRE', 'Estado drenaje'],
        ['ALTURA_SOB', 'Altura (m)'],
        ['TIPO_CURVA', 'Tipo de curva'],
        ['CODIGO_USO', 'Código de uso'],
        ['CODIGO_NOM', 'Código']
    ];
    const filas = campos
        .filter(([k]) => props[k] !== undefined && props[k] !== null && props[k] !== '')
        .map(([k, etiqueta]) => `<p style="margin:2px 0"><strong>${etiqueta}:</strong> ${props[k]}</p>`);
    return filas.length ? `<div>${filas.join('')}</div>` : '<div>Sin atributos</div>';
}

// Carga (una sola vez) el GeoJSON de una capa dentro de su layerGroup
function cargarCapaBoyaca(cfg, onComplete) {
    const infoDiv = document.querySelector('.info');
    const loadingId = `loading-${cfg.file.replace('.', '-')}`;
    if (infoDiv && !document.getElementById(loadingId)) {
        infoDiv.innerHTML += `<p id="${loadingId}" style="color:#d84315; margin:4px 0 0 0; font-weight:bold;">⏳ Cargando ${cfg.label}...</p>`;
    }

    fetch(boyacaDataDir + cfg.file)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            const capa = L.geoJSON(data, {
                style: cfg.estilo,
                pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
                    radius: cfg.radio || 4,
                    color: cfg.color,
                    fillColor: cfg.color,
                    weight: 1,
                    fillOpacity: 0.8
                }),
                onEachFeature: (feature, layer) => {
                    if (feature.properties) {
                        layer.bindPopup(popupBoyaca(feature.properties));
                    }
                }
            });
            capa.addTo(cfg._group);
            if (cfg.file === 'Administrativo_P.geojson') {
                toponimosLayer = capa;
            }
            if (onComplete) onComplete(capa);
        })
        .catch(error => {
            console.error('Error cargando capa ' + cfg.file + ':', error);
            alert(`No se pudo cargar la capa "${cfg.label}". Verifica la ruta del archivo.`);
        })
        .finally(() => {
            const msg = document.getElementById(loadingId);
            if (msg) msg.remove();
        });
}

// Registrar cada capa como overlay con carga diferida
capasBoyaca.forEach(cfg => {
    cfg._group = L.layerGroup();
    cfg._loaded = false;
    controlLayer.addOverlay(cfg._group, cfg.label);
});

// Al activar una capa por primera vez, descargar su GeoJSON
map.on('overlayadd', function (e) {
    const cfg = capasBoyaca.find(c => c._group === e.layer);
    if (cfg && !cfg._loaded) {
        cfg._loaded = true;
        cargarCapaBoyaca(cfg);
    }
});

function onEachFeature(feature, layer) {
    // Popup al hacer clic
    if (feature.properties) {
        const popupContent = `
            <div style="text-align: center;">
                <h3>${feature.properties.dpto_cnmbr}</h3>
                <p><strong>Código:</strong> ${feature.properties.dpto_ccdgo}</p>
            </div>
        `;
        layer.bindPopup(popupContent);
    }

    // Highlight al pasar el mouse
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
        weight: 4,
        color: '#2e7d32',
        fillOpacity: 0.25
    });

    layer.bringToFront();
}

function resetHighlight(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 2.5,
        color: '#1b5e20',
        fillOpacity: 0.12
    });
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Control de escala
L.control.scale({
    position: 'bottomleft',
    metric: true,
    imperial: false
}).addTo(map);

// Panel de información
const info = L.control({position: 'topleft'});

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = `
        <h4>Boyacá - Servicios Geográficos</h4>
        <p>Visualización del departamento y sus municipios</p>
        <p><small>Datos: DANE - IGAC | Servidor: GeoServer / ArcGIS</small></p>
    `;
    return this._div;
};

info.addTo(map);

// Leyenda cartográfica dinámica
const legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    div.style.background = 'rgba(255, 255, 255, 0.92)';
    div.style.padding = '8px 12px';
    div.style.borderRadius = '6px';
    div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.3)';
    div.innerHTML = '<h4 style="margin:0 0 6px 0; font-size:13px;">Convenciones IGAC</h4>';

    capasBoyaca.forEach(cfg => {
        const color = cfg.color || cfg.estilo.color;
        const forma = cfg.tipo === 'punto'
            ? 'border-radius:50%; width:10px; height:10px; margin:0 8px 0 2px;'
            : (cfg.tipo === 'linea'
                ? 'height:3px; width:14px; margin-right:6px;'
                : 'width:14px; height:14px; margin-right:6px; border-radius:2px;');

        div.innerHTML += `
            <div style="display:flex; align-items:center; margin-bottom:4px;">
                <span style="display:inline-block; background:${color}; ${forma}"></span>
                <small style="font-size:11px;">${cfg.label}</small>
            </div>
        `;
    });

    return div;
};

legend.addTo(map);

// Crear control de búsqueda
const searchControl = L.control({position: 'topright'});

searchControl.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'search-control');
    div.innerHTML = `
        <input type="text" id="search-input" placeholder="Buscar lugar o departamento...">
        <button id="search-button">Buscar</button>
    `;
    L.DomEvent.disableClickPropagation(div);
    return div;
};

searchControl.addTo(map);

// Función de búsqueda (busca en Topónimos de Boyacá y en Departamentos)
document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    function ejecutarBusqueda(searchText) {
        let encontrado = null;

        // 1. Buscar primero en topónimos administrativos de Boyacá (si están cargados)
        if (toponimosLayer) {
            toponimosLayer.eachLayer(function(layer) {
                const nombreGeo = (layer.feature.properties.NOMBRE_GEO || '').toLowerCase();
                if (!encontrado && nombreGeo.includes(searchText)) {
                    encontrado = layer;
                }
            });
        }

        if (encontrado) {
            if (!map.hasLayer(toponimosLayer)) {
                toponimosLayer.addTo(map);
            }
            map.setView(encontrado.getLatLng(), 13);
            encontrado.openPopup();
            return;
        }

        // 2. Si no está en topónimos, buscar en la capa de departamentos
        if (departamentosGeoJSON) {
            departamentosGeoJSON.eachLayer(function(layer) {
                const nombre = (layer.feature.properties.dpto_cnmbr || '').toLowerCase();
                if (!encontrado && nombre.includes(searchText)) {
                    encontrado = layer;
                }
            });
        }

        if (encontrado) {
            map.fitBounds(encontrado.getBounds());
            encontrado.openPopup();
        } else {
            alert('No se encontró: ' + searchInput.value);
        }
    }

    function buscar() {
        const searchText = searchInput.value.trim().toLowerCase();
        if (!searchText) return;

        // Si la capa de topónimos aún no se ha descargado, la carga automáticamente antes de buscar
        const cfgToponimos = capasBoyaca.find(c => c.file === 'Administrativo_P.geojson');
        if (cfgToponimos && !cfgToponimos._loaded) {
            cfgToponimos._loaded = true;
            cfgToponimos._group.addTo(map);
            cargarCapaBoyaca(cfgToponimos, () => ejecutarBusqueda(searchText));
        } else {
            ejecutarBusqueda(searchText);
        }
    }

    searchButton.addEventListener('click', buscar);
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') buscar();
    });
});

// Marcador de Tunja (capital de Boyacá)
const TunjaMarker = L.marker([5.53, -73.35])
    .addTo(map)
    .bindPopup('<b>Tunja</b><br>Capital de Boyacá');

    