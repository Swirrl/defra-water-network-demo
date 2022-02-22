const waterNetworkAPIBase = "https://defra-water-network-dev.publishmydata.com/water-network/api/v1";

export async function getHydroNodesNearby(coords) {
  const url = waterNetworkAPIBase +
              "/collections/HydroNode/items"
              + "?point=" +
              coords.join(",");
  // const headers = {"Authorization": "Basic dGVzdEB0ZXN0LmNvbTo0OTdhNTcyMmI2OWYzNGY4YTAzMTQwMDEyNDZhYWIyMzgwYjQ3ZjFk"};
  const response = await fetch(url, {method: "GET",
                                       // headers: headers
                                    });
  const hydroNodes = await response.json();
  return hydroNodes;
}

function getAllWatercourseLinkIds({properties}) {
  const upstream = properties.upstreamWatercourseLinkIds;
  const downstream = properties.downstreamWatercourseLinkIds;
  console.log("upstream:", upstream);
  console.log("downstream:", downstream);
  let ids = [];

  if (upstream?.length > 0) {
    ids.push(...upstream);
  }

  if (downstream?.length > 0) {
    ids.push(...downstream);
  }

  return ids;
}

function watercourseLinkURL(id) {
  return waterNetworkAPIBase + "/collections/WatercourseLink/items/" + id;
}

export async function getWatercourseLinks(hydroNode) {
  const ids = getAllWatercourseLinkIds(hydroNode);
  const watercourseLinks = [];

  for (const id of ids) {
    // TODO: get watercourse link ids here...
    const url = watercourseLinkURL(id);
    const response = await fetch(url, {method: "GET",
                                       // headers: headers
                                      });
    const watercourseLink = await response.json();
    watercourseLinks.push(watercourseLink);

  }
  // const headers = {"Authorization": "Basic dGVzdEB0ZXN0LmNvbTo0OTdhNTcyMmI2OWYzNGY4YTAzMTQwMDEyNDZhYWIyMzgwYjQ3ZjFk"};
  return {
    type: "FeatureCollection",
    features: watercourseLinks
  };
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
    "paint": {"circle-color": "#004e7f"}
  });
}
