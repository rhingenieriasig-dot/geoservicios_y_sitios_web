// ============================================================
// 1. INICIALIZACIÓN DEL MAPA Y CAPAS BASE
// ============================================================
const map = L.map('map').setView([5.53, -73.35], 8);

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
});

const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19
});

// Agregar capa base por defecto (evita duplicados)
osmLayer.addTo(map);

// ============================================================
// 2. SERVICIOS WMS EXTERNOS (DANE)
// ============================================================
const daneWmsUrl = 'https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer';
const BOYACA_CCDGO = '15';
let boyacaBounds = null;

const departamentosWMS = L.tileLayer.wms(daneWmsUrl, {
    layers: '8',
    format: 'image/png',
    transparent: true,
    attribution: 'DANE - MGN 2024'
});

const municipiosWMS = L.tileLayer.wms(daneWmsUrl, {
    layers: '7',
    format: 'image/png',
    transparent: true,
    attribution: 'DANE - MGN 2024'
}).addTo(map); // Activado por defecto para ver división municipal

// ============================================================
// 3. CONTROL DE CAPAS
// ============================================================
const baseMaps = {
    "OpenStreetMap": osmLayer,
    "Mapa Claro (Carto)": cartoLight,
    "Satélite (Esri)": satelliteLayer
};

const overlayMaps = {
    "Límite Departamental (WMS)": departamentosWMS,
    "Municipios (WMS)": municipiosWMS
};

const controlLayer = L.control.layers(baseMaps, overlayMaps, {
    collapsed: window.innerWidth < 768 // Colapsado automáticamente en móviles
}).addTo(map);

// ============================================================
// 4. CONTROLES DE INTERFAZ (INFO, LEYENDA, ESCALA, HOME)
// ============================================================
L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);

// Panel de información dinámico
const info = L.control({ position: 'topleft' });
info.onAdd = function () {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};
info.update = function (props) {
    this._div.innerHTML = `
        <h4>Geovisor Boyacá</h4>
        ${props
            ? `<b>${props.dpto_cnmbr || props.mpio_cnmbr}</b><br>Código DANE: ${props.dpto_ccdgo || props.mpio_ccdgo}`
            : '<span>Pasa el cursor o haz clic sobre una entidad</span>'}
        <div id="loading-status" style="display:none; color:#d84315; font-weight:bold; margin-top:5px;">
            ⏳ Descargando capa...
        </div>
        <p style="margin-top:6px; font-size:11px; color:#666;">Fuentes: DANE / IGAC</p>
    `;
};
info.addTo(map);

// Botón para restaurar zoom a todo Boyacá
const homeControl = L.control({ position: 'topleft' });
homeControl.onAdd = function () {
    const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    btn.innerHTML = '⌂';
    btn.title = 'Centrar en Boyacá';
    btn.style.cssText = 'width:30px; height:30px; font-size:18px; cursor:pointer; background:#fff; border:none;';
    btn.onclick = () => { if (boyacaBounds) map.fitBounds(boyacaBounds); };
    return btn;
};
homeControl.addTo(map);

// Leyenda cartográfica
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const items = [
        { color: '#e8f881', border: '#232323', label: 'Límite Boyacá', tipo: 'box' },
        { color: '#66bb6a', border: '#1b5e20', label: 'Bosques', tipo: 'box' },
        { color: '#e65100', label: 'Vías', tipo: 'line' },
        { color: '#1e88e5', label: 'Drenaje sencillo', tipo: 'line' },
        { color: '#8d6e63', label: 'Curvas de nivel', tipo: 'line' },
        { color: '#c62828', label: 'Topónimos', tipo: 'circle' },
        { color: '#6d4c41', label: 'Construcciones', tipo: 'circle' }
    ];

    div.innerHTML = '<strong>Simbología</strong><br>';
    items.forEach(item => {
        if (item.tipo === 'box') {
            div.innerHTML += `<i style="background:${item.color}; border:1px solid ${item.border};"></i> ${item.label}<br>`;
        } else if (item.tipo === 'line') {
            div.innerHTML += `<i style="background:${item.color}; height:3px; margin-top:7px;"></i> ${item.label}<br>`;
        } else {
            div.innerHTML += `<i style="background:${item.color}; border-radius:50%; width:10px; height:10px; margin:4px 12px 0 4px;"></i> ${item.label}<br>`;
        }
    });
    return div;
};
legend.addTo(map);

// ============================================================
// 5. CARGA DE LÍMITE DEPARTAMENTAL (GEOJSON / WFS)
// ============================================================
const departamentosWFSUrl = 'datos/departamentos.geojson';
let departamentosGeoJSON;

fetch(departamentosWFSUrl)
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    })
    .then(data => {
        departamentosGeoJSON = L.geoJSON(data, {
            filter: feature => feature.properties.dpto_ccdgo === BOYACA_CCDGO,
            style: {
                color: '#232323',
                weight: 2.5,
                fillColor: '#e8f881',
                fillOpacity: 0.25
            },
            onEachFeature: (feature, layer) => {
                layer.bindPopup(`
                    <div style="text-align:center;">
                        <h3 style="margin:0 0 4px;">${feature.properties.dpto_cnmbr}</h3>
                        <p style="margin:0;"><strong>Código DANE:</strong> ${feature.properties.dpto_ccdgo}</p>
                    </div>
                `);
                layer.on({
                    mouseover: e => {
                        e.target.setStyle({ weight: 4, color: '#000', fillOpacity: 0.4 });
                        info.update(e.target.feature.properties);
                    },
                    mouseout: e => {
                        departamentosGeoJSON.resetStyle(e.target);
                        info.update();
                    },
                    click: e => map.fitBounds(e.target.getBounds())
                });
            }
        }).addTo(map);

        controlLayer.addOverlay(departamentosGeoJSON, "Boyacá (Vectorial)");

        boyacaBounds = departamentosGeoJSON.getBounds();
        departamentosWMS.options.bounds = boyacaBounds;
        municipiosWMS.options.bounds = boyacaBounds;
        municipiosWMS.redraw();
        map.fitBounds(boyacaBounds);
    })
    .catch(error => console.error('Error cargando límite departamental:', error));

// ============================================================
// 6. CAPAS DETALLADAS DE BOYACÁ (CARGA DIFERIDA / LAZY LOADING)
// ============================================================
// Nota: Se recomienda renombrar la carpeta a 'datos/15_BOYACA/' sin tilde
const boyacaDataDir = 'datos/15_BOYACA/';

const capasBoyaca = [
    { file: 'Administrativo_P.geojson', label: 'Topónimos administrativos', color: '#c62828', radio: 4 },
    { file: 'Construccion_P.geojson', label: 'Construcciones', color: '#6d4c41', radio: 3 },
    { file: 'Via.geojson', label: 'Vías', estilo: { color: '#e65100', weight: 1.5 } },
    { file: 'Drenaje_Sencillo.geojson', label: 'Drenaje sencillo', estilo: { color: '#1e88e5', weight: 1 } },
    { file: 'Curva_Nivel.geojson', label: 'Curvas de nivel', estilo: { color: '#8d6e63', weight: 0.8 } },
    { file: 'Bosque.geojson', label: 'Bosques', estilo: { color: '#1b5e20', weight: 1, fillColor: '#66bb6a', fillOpacity: 0.4 } }
];

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
    return filas.length ? `<div>${filas.join('')}</div>` : '<div>Sin atributos disponibles</div>';
}

function cargarCapaBoyaca(cfg) {
    const loader = document.getElementById('loading-status');
    if (loader) loader.style.display = 'block';

    fetch(boyacaDataDir + cfg.file)
        .then(response => {
            if (!response.ok) throw new Error(`No se encontró ${cfg.file}`);
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
        })
        .catch(error => {
            console.error('Error cargando capa ' + cfg.file + ':', error);
            alert(`Error al cargar la capa "${cfg.label}". Verifica que el archivo exista.`);
        })
        .finally(() => {
            if (loader) loader.style.display = 'none';
        });
}

capasBoyaca.forEach(cfg => {
    cfg._group = L.layerGroup();
    cfg._loaded = false;
    controlLayer.addOverlay(cfg._group, cfg.label);
});

map.on('overlayadd', function (e) {
    const cfg = capasBoyaca.find(c => c._group === e.layer);
    if (cfg && !cfg._loaded) {
        cfg._loaded = true;
        cargarCapaBoyaca(cfg);
    }
});

// ============================================================
// 7. BUSCADOR DE TOPÓNIMOS / ENTIDADES
// ============================================================
const searchControl = L.control({ position: 'topright' });
searchControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'info search-control');
    div.innerHTML = `
        <input type="text" id="search-input" placeholder="Buscar municipio o lugar..." style="padding:4px; border:1px solid #ccc; border-radius:3px;">
        <button id="search-button" style="padding:4px 8px; cursor:pointer;">Buscar</button>
    `;
    L.DomEvent.disableClickPropagation(div);
    return div;
};
searchControl.addTo(map);

// Si tienes un archivo datos/municipios_boyaca.geojson, cárgalo aquí para habilitar la búsqueda municipal
let municipiosBoyacaLayer = null;
fetch('datos/municipios_boyaca.geojson')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
        if (!data) return;
        municipiosBoyacaLayer = L.geoJSON(data, {
            style: { color: '#555', weight: 1, fillOpacity: 0.05 },
            onEachFeature: (f, l) => {
                l.bindPopup(`<b>Municipio:</b> ${f.properties.mpio_cnmbr}<br><b>Código:</b> ${f.properties.mpio_ccdgo}`);
                l.on({
                    mouseover: e => info.update(e.target.feature.properties),
                    mouseout: () => info.update()
                });
            }
        });
        controlLayer.addOverlay(municipiosBoyacaLayer, "Municipios Boyacá (Búsqueda)");
    })
    .catch(() => { /* Opcional: si no existe el archivo, el buscador usará departamentosGeoJSON */ });

document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    function buscar() {
        const searchText = searchInput.value.trim().toLowerCase();
        if (!searchText) return;

        const capaObjetivo = municipiosBoyacaLayer || departamentosGeoJSON;
        if (!capaObjetivo) return;

        let encontrado = null;
        capaObjetivo.eachLayer(function (layer) {
            const props = layer.feature.properties;
            const nombre = (props.mpio_cnmbr || props.dpto_cnmbr || '').toLowerCase();
            if (!encontrado && nombre.includes(searchText)) {
                encontrado = layer;
            }
        });

        if (encontrado) {
            if (!map.hasLayer(capaObjetivo)) capaObjetivo.addTo(map);
            map.fitBounds(encontrado.getBounds());
            encontrado.openPopup();
        } else {
            alert('No se encontró coincidencia para: ' + searchInput.value);
        }
    }

    searchButton.addEventListener('click', buscar);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') buscar(); });
});

// ============================================================
// 8. MARCADOR CAPITAL
// ============================================================
L.marker([5.5353, -73.3678])
    .addTo(map)
    .bindPopup('<b>Tunja</b><br>Capital del departamento de Boyacá');