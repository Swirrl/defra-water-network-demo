import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

export function getMapBoundingBox(map) {
  const {_sw, _ne} = map.getBounds();
  return [_sw.lng, _sw.lat, _ne.lng, _ne.lat];
}

export function setupEmptyOverlays(map) {
  map.addSource("watercourseLinks", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  map.addLayer({
    "id": "watercourseLinks",
    "type": "line",
    "source": "watercourseLinks",
    "layout": {
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
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
    "id": "hydroNodes",
    "type": "circle",
    "source": "hydroNodes",
    "paint": {
      "circle-color": "#004e7f",
      "circle-radius": 5
    }
  });
}

function getHydroNodeCategory({hydroNodeCategory}) {
  return hydroNodeCategory.split("/").pop();
}

function hydroNodePropertiesToHTML({properties}) {
  return (
    `<table>
       <caption style="font-weight: bold; caption-side: top">HydroNode</caption>
       <tr>
         <th>ID</th>
         <td>${properties.id}</td>
       </tr>
       <tr>
         <th>Category</th>
         <td>${getHydroNodeCategory(properties)}</td>
       </tr>
     </table>`);
}

function watercourseLinkPropertiesToHTML({properties}) {
  return (
    `<table>
       <caption style="font-weight: bold; caption-side: top">WatercourseLink</caption>
       <tr>
         <th>ID</th>
         <td>${properties.id}</td>
       </tr>
       <tr>
         <th>Length</th>
         <td>${properties.length}</td>
       </tr>
     </table>`);
}

export function setupLayerPopups(map) {
  map.on("click", "hydroNodes", (e) => {
    e.originalEvent.preventDefault();
    const coords = e.features[0].geometry.coordinates;
    const text = hydroNodePropertiesToHTML(e.features[0]);

    new mapboxgl.Popup()
      .setLngLat(coords)
      .setHTML(text)
      .addTo(map);
  });

  map.on("click", "watercourseLinks", (e) => {
    if (e.originalEvent.defaultPrevented)  return;

    const coords = e.lngLat;
    const text = watercourseLinkPropertiesToHTML(e.features[0]);

    new mapboxgl.Popup()
      .setLngLat(coords)
      .setHTML(text)
      .addTo(map);
  });

  // Change cursor to a pointer when the mouse is over the feature layers
  map.on("mouseenter", "hydroNodes", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "watercourseLinks", () => {
    map.getCanvas().style.cursor = "";
  });


  map.on("mouseenter", "watercourseLinks", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "watercourseLinks", () => {
    map.getCanvas().style.cursor = "";
  });
}
