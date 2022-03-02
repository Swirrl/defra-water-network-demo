import { getMapBoundingBox } from "../utils/map";

const waterNetworkAPIBase = "https://defra-water-network-prod.publishmydata.com/water-network/api/v1";
const waterNetworkAPIKey = process.env.REACT_APP_WATER_NETWORK_API_KEY;

const getURL = async (url) => {
  const headers = {
    "Authorization": `Basic ${waterNetworkAPIKey}`
  };

  return await fetch(url, {method: "GET",
                           headers: headers
                          }).then(response => response.json());
};

const getNextPageLink = (response) => {
  return response.links.find((link) => link.rel === "next");
};

const mergeFeatures = (response, nextPageResponse) => {
  const allFeatures = response.features.concat(...nextPageResponse.features);
  return {
    ...nextPageResponse,
    features: allFeatures,
    numberReturned: response.numberReturned + nextPageResponse.numberReturned
  };
};

const getBBoxPages = async (response) => {
  let nextPageLink = getNextPageLink(response);

  if (nextPageLink) {
    const nextPageResponse = await getURL(nextPageLink.href);
    const nextResponse = mergeFeatures(response, nextPageResponse);
    return getBBoxPages(nextResponse);
  } else {
    return response;
  }
};

const getFeaturesInBoundingBox = async (collection, mapBounds) => {
  const url = waterNetworkAPIBase +
        "/collections/" + collection + "/items" +
        "?bbox=" + mapBounds.join(",");

  let response = await getURL(url);
  return getBBoxPages(response);
};

const bboxPolygon = ([swLng, swLat, neLng, neLat]) => {
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

export const displayFeaturesInMapViewport = async (map) => {
  const mapBounds = getMapBoundingBox(map);
  const box = bboxPolygon(mapBounds);
  map.getSource("bbox").setData(box);

  await getFeaturesInBoundingBox("HydroNode", mapBounds)
    .then((hydroNodes) => {
      map.getSource("hydroNodes").setData(hydroNodes);
    });

  await getFeaturesInBoundingBox("WatercourseLink", mapBounds)
    .then((watercourseLinks) => {
      map.getSource("watercourseLinks").setData(watercourseLinks);
    });
};
