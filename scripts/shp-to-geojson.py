#!/usr/bin/env python3
"""
Shapefile → GeoJSON dönüşümü
TUREF TM30 (EPSG:5254) → WGS84 (EPSG:4326)
"""
import json
import shapefile
from pyproj import Transformer

SHP_PATH = "/home/user/spherical/public/vector/pafta_index/bursa_itrf_30_3_5000.shp"
OUT_PATH = "/home/user/spherical/public/vector/pafta_index/bursa-paftalar.geojson"

# TUREF TM30 → WGS84
transformer = Transformer.from_crs("EPSG:5254", "EPSG:4326", always_xy=True)

def transform_coords(coords):
    """Tek bir halkadaki koordinatları dönüştür"""
    return [list(transformer.transform(x, y)) for x, y in coords]

def transform_geometry(geom_type, coords):
    if geom_type == "Polygon":
        return [transform_coords(ring) for ring in coords]
    elif geom_type == "MultiPolygon":
        return [[transform_coords(ring) for ring in polygon] for polygon in coords]
    return coords

print(f"Okunuyor: {SHP_PATH}")
sf = shapefile.Reader(SHP_PATH, encoding="utf-8")

print(f"Alanlar: {[f[0] for f in sf.fields[1:]]}")
print(f"Kayıt sayısı: {len(sf.shapes())}")

features = []
for i, (shape, record) in enumerate(zip(sf.shapes(), sf.records())):
    # Shape tipini al
    if shape.shapeType in (5, 15, 25):  # Polygon variants
        geom_type = "Polygon"
        # shapefile parts'ı kullanarak halkalara böl
        parts = list(shape.parts) + [len(shape.points)]
        rings = []
        for j in range(len(parts) - 1):
            ring = shape.points[parts[j]:parts[j+1]]
            rings.append(ring)
        coords = transform_geometry("Polygon", rings)
    else:
        continue

    # Öznitelikleri al
    props = {}
    for field, value in zip(sf.fields[1:], record):
        field_name = field[0]
        if isinstance(value, bytes):
            value = value.decode("utf-8", errors="ignore")
        props[field_name] = value

    features.append({
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": coords,
        },
        "properties": props,
    })

geojson = {
    "type": "FeatureCollection",
    "name": "bursa_paftalar_5000",
    "crs": {
        "type": "name",
        "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
    },
    "features": features,
}

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, separators=(",", ":"))

import os
size_kb = os.path.getsize(OUT_PATH) / 1024
print(f"✓ Yazıldı: {OUT_PATH}")
print(f"✓ Boyut: {size_kb:.1f} KB")
print(f"✓ Kayıt: {len(features)} pafta")

# Örnek ilk pafta
if features:
    print(f"\nİlk pafta:")
    print(f"  Özellikler: {features[0]['properties']}")
    coords_sample = features[0]['geometry']['coordinates'][0][:2]
    print(f"  İlk 2 koordinat: {coords_sample}")
