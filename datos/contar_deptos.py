import json

with open('departamentos.geojson', encoding='utf-8') as f:
    d = json.load(f)

print(f"Tipo Raiz: {d['type']} | Total Features: {len(d['features'])}\n")
print(f"{'#':<3} | {'COD':<4} | {'DEPARTAMENTO':<28} | {'GEOMETRIA':<13} | {'POLIGONOS'}")
print('-' * 68)

for i, f in enumerate(d['features']):
    codigo = str(f['properties'].get('dpto_ccdgo', '-'))
    nombre = str(f['properties'].get('dpto_cnmbr', '-'))
    geom_tipo = f['geometry']['type']
    num_poligonos = len(f['geometry']['coordinates'])
    print(f"{i+1:<3} | {codigo:<4} | {nombre:<28} | {geom_tipo:<13} | {num_poligonos}")