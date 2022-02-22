const waterNetworkAPIBase = "https://defra-water-network-dev.publishmydata.com/water-network/api/v1";

export async function getFeaturesInBoundingBox(collection, mapBounds) {
  const url = waterNetworkAPIBase +
        "/collections/" + collection + "/items" +
        "?bbox=" + mapBounds.join(",");
  // const headers = {"Authorization": "Basic dGVzdEB0ZXN0LmNvbTo0OTdhNTcyMmI2OWYzNGY4YTAzMTQwMDEyNDZhYWIyMzgwYjQ3ZjFk"};
  const response = await fetch(url, {method: "GET",
                                     // headers: headers
                                    });
  const hydroNodes = await response.json();
  return hydroNodes;

}

export async function getHydroNodes(mapBounds) {
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
