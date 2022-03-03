export const getMapBoundingBox = (map) => {
  const {_sw, _ne} = map.getBounds();
  return [_sw.lng, _sw.lat, _ne.lng, _ne.lat];
};

const addGeoJSONSource = (map, name) => {
  map.addSource(name, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });
};

export const setupEmptyOverlays = (map) => {
  addGeoJSONSource(map, "bbox");
  map.addLayer({
    id: "bbox",
    type: "line",
    source: "bbox",
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#c13634",
      "line-width": 2
    }
  });

  addGeoJSONSource(map, "watercourseLinks");
  map.addLayer({
    id: "watercourseLinks",
    type: "line",
    source: "watercourseLinks",
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#0079c4",
      "line-width": 4
    }
  });

  addGeoJSONSource(map, "hydroNodes");
  map.addLayer({
    id: "hydroNodes",
    type: "circle",
    source: "hydroNodes",
    paint: {
      "circle-color": "#004e7f",
      "circle-radius": 5
    }
  });

  addGeoJSONSource(map, "biosysSites");
  map.addLayer({
    id: "biosysSites",
    type: "circle",
    source: "biosysSites",
    paint: {
      "circle-color": "#379102",
      "circle-radius": 8
    }
  });

  addGeoJSONSource(map, "waterQualitySites");
  map.addLayer({
    id: "waterQualitySites",
    type: "circle",
    source: "waterQualitySites",
    paint: {
      "circle-color": "#379102",
      "circle-radius": 8
    }
  });

  addGeoJSONSource(map, "riverLevelSites");
  map.addLayer({
    id: "riverLevelSites",
    type: "circle",
    source: "riverLevelSites",
    paint: {
      "circle-color": "#d18700",
      "circle-radius": 8
    }
  });

  addGeoJSONSource(map, "freshwaterSites");
  map.addLayer({
    id: "freshwaterSites",
    type: "circle",
    source: "freshwaterSites",
    paint: {
      "circle-color": "#720e93",
      "circle-radius": 8
    }
  });

};

export const bboxPolygon = ([swLng, swLat, neLng, neLat]) => {
  return {
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [[swLng, swLat],
                      [swLng, neLat],
                      [neLng, neLat],
                      [neLng, swLat],
                      [swLng, swLat]]
    }
  };
};
