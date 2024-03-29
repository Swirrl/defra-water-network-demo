import chevronPink from "./icons/chevronPink.svg";
import chevronBlue from "./icons/chevronBlue.svg";

export const getMapBoundingBox = (map) => {
  const { _sw, _ne } = map.getBounds();
  return [_sw.lng, _sw.lat, _ne.lng, _ne.lat];
};

export const getBboxCorners = (map) => {
  const { _sw, _ne } = map.getBounds();

  return {
    sw: { lng: _sw.lng, lat: _sw.lat },
    nw: { lng: _sw.lng, lat: _ne.lat },
    ne: { lng: _ne.lng, lat: _ne.lat },
    se: { lng: _ne.lng, lat: _sw.lat },
  };
};

const addGeoJSONSource = (map, name) => {
  map.addSource(name, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
    generateId: true,
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
      "line-cap": "round",
    },
    paint: {
      "line-color": "#c13634",
      "line-width": 2,
    },
  });

  addGeoJSONSource(map, "watercourseLinks");
  map.addLayer({
    id: "watercourseLinks",
    type: "line",
    source: "watercourseLinks",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "orange",
        "#0079c4",
      ],
      "line-width": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        8,
        4,
      ],
    },
  });

  addGeoJSONSource(map, "highlightWatercourseLink");
  map.addLayer({
    id: "highlightWatercourseLink",
    type: "line",
    source: "highlightWatercourseLink",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#06a516",
      "line-width": 8,
    },
  });

  addGeoJSONSource(map, "upstreamWatercourseLinks");
  map.addLayer({
    id: "upstreamWatercourseLinks",
    type: "line",
    source: "upstreamWatercourseLinks",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "pink",
      "line-width": 8,
    },
  });

  const upstreamIcon = new Image(8, 8);
  upstreamIcon.src = chevronPink;
  upstreamIcon.onload = () => map.addImage("upstreamIcon", upstreamIcon);
  map.addLayer({
    id: "upstreamWatercourseLinksArrows",
    type: "symbol",
    source: "upstreamWatercourseLinks",
    paint: {},
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": 20,
      "icon-image": "upstreamIcon",
      "icon-rotate": 90,
    },
  });

  addGeoJSONSource(map, "downstreamWatercourseLinks");
  map.addLayer({
    id: "downstreamWatercourseLinks",
    type: "line",
    source: "downstreamWatercourseLinks",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "light blue",
      "line-width": 8,
    },
  });

  const downstreamIcon = new Image(8, 8);
  downstreamIcon.src = chevronBlue;
  downstreamIcon.onload = () => map.addImage("downstreamIcon", downstreamIcon);
  map.addLayer({
    id: "downstreamWatercourseLinksArrows",
    type: "symbol",
    source: "downstreamWatercourseLinks",
    paint: {},
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": 20,
      "icon-image": "downstreamIcon",
      "icon-rotate": 90,
    },
  });

  addGeoJSONSource(map, "hydroNodes");
  map.addLayer({
    id: "hydroNodes",
    type: "circle",
    source: "hydroNodes",
    paint: {
      "circle-color": "#004e7f",
      "circle-radius": 5,
    },
  });

  addGeoJSONSource(map, "biosysSites");
  map.addLayer({
    id: "biosysSites",
    type: "circle",
    source: "biosysSites",
    paint: {
      "circle-color": "#379102",
      "circle-radius": 8,
    },
  });

  addGeoJSONSource(map, "waterQualitySites");
  map.addLayer({
    id: "waterQualitySites",
    type: "circle",
    source: "waterQualitySites",
    paint: {
      "circle-color": "#31ede6",
      "circle-radius": 8,
    },
  });

  addGeoJSONSource(map, "riverLevelSites");
  map.addLayer({
    id: "riverLevelSites",
    type: "circle",
    source: "riverLevelSites",
    paint: {
      "circle-color": "#d18700",
      "circle-radius": 8,
    },
  });

  addGeoJSONSource(map, "riverFlowSites");
  map.addLayer({
    id: "riverFlowSites",
    type: "circle",
    source: "riverFlowSites",
    paint: {
      "circle-color": "#e200b5",
      "circle-radius": 8,
    },
  });

  addGeoJSONSource(map, "freshwaterSites");
  map.addLayer({
    id: "freshwaterSites",
    type: "circle",
    source: "freshwaterSites",
    paint: {
      "circle-color": "#720e93",
      "circle-radius": 8,
    },
  });

  addGeoJSONSource(map, "bristolWaterQualitySites");
  map.addLayer({
    id: "bristolWaterQualitySites",
    type: "circle",
    source: "bristolWaterQualitySites",
    paint: {
      "circle-color": "yellow",
      "circle-radius": 8,
    },
  });
};

export const bboxPolygon = ([swLng, swLat, neLng, neLat]) => {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [swLng, swLat],
        [swLng, neLat],
        [neLng, neLat],
        [neLng, swLat],
        [swLng, swLat],
      ],
    },
  };
};

export const unhighlightWatercourseLink = (map) => {
  map.getSource("highlightWatercourseLink").setData({
    type: "FeatureCollection",
    features: [],
  });
};

export const clearUpstreamDownstream = (map) => {
  map.getSource("upstreamWatercourseLinks").setData({
    type: "FeatureCollection",
    features: [],
  });

  map.getSource("downstreamWatercourseLinks").setData({
    type: "FeatureCollection",
    features: [],
  });
};
