import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

export const getMapBoundingBox = (map) => {
  const {_sw, _ne} = map.getBounds();
  return [_sw.lng, _sw.lat, _ne.lng, _ne.lat];
};

export const setupEmptyOverlays = (map) => {
  map.addSource("bbox", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: []
      }
    }
  });

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

  map.addSource("watercourseLinks", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

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

  map.addSource("hydroNodes", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  map.addLayer({
    id: "hydroNodes",
    type: "circle",
    source: "hydroNodes",
    paint: {
      "circle-color": "#004e7f",
      "circle-radius": 5
    }
  });
};
