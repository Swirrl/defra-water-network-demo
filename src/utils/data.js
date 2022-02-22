const waterNetworkAPIBase = "https://defra-water-network-dev.publishmydata.com/water-network/api/v1";

async function getURL(url) {
  return await fetch(url, {method: "GET",
                                     // headers: headers
                          }).then(response => response.json());
}

function getNextPageLink(response) {
  return response.links.find((link) => link.rel === "next");
}

function mergeFeatures(response, nextPageResponse) {
  const allFeatures = response.features.concat(...nextPageResponse.features);
  return {
    ...nextPageResponse,
    features: allFeatures,
    numberReturned: response.numberReturned + nextPageResponse.numberReturned
  };
}

async function getBBoxPages(response) {
  let nextPageLink = getNextPageLink(response);

  if (nextPageLink) {
    const nextPageResponse = await getURL(nextPageLink.href);
    const nextResponse = mergeFeatures(response, nextPageResponse);
    return getBBoxPages(nextResponse);
  } else {
    return response;
  }
}

export async function getFeaturesInBoundingBox(collection, mapBounds) {
  const url = waterNetworkAPIBase +
        "/collections/" + collection + "/items" +
        "?bbox=" + mapBounds.join(",");
  // const headers = {"Authorization": "Basic dGVzdEB0ZXN0LmNvbTo0OTdhNTcyMmI2OWYzNGY4YTAzMTQwMDEyNDZhYWIyMzgwYjQ3ZjFk"};

  let response = await getURL(url);
  return getBBoxPages(response);
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
