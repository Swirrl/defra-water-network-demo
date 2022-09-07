import { getMapBoundingBox, bboxPolygon } from "../utils/map";

export const waterNetworkAPIBase = "https://defra-water-network-prod.publishmydata.com/water-network/api/v1";
export const waterNetworkAPIKey = process.env.REACT_APP_WATER_NETWORK_API_KEY;

export const getURL = async (url) => {
  const headers = {
    "Authorization": `Basic ${waterNetworkAPIKey}`
  };

  return await fetch(url, {method: "GET", headers: headers
                          }).then(response => response.json());
};

const getNextPageLink = (response) => {
  const nextLink = response.links.find((link) => link.rel === "next");

  // Workaround, since the current API's domain is: defra-water-network-prod.publishmydata.com
  // but the API returns next links with the domain we'll eventually use: environment.data.gov.uk
  if (nextLink) {
    return [waterNetworkAPIBase, ...nextLink.href.split('/').slice(6)].join('/')
  }
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
    const nextPageResponse = await getURL(nextPageLink);
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

export const displayWaterNetworkFeaturesInMapViewport = async (map) => {
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

export const getWatercourseLink = async (id) => {
  const url = waterNetworkAPIBase + "/collections/" + "WatercourseLink" + "/items/" + id;
  return await getURL(url);
}

export const getHydroNode = async (id) => {
  const url = waterNetworkAPIBase + "/collections/" + "HydroNode" + "/items/" + id;
  return await getURL(url);
}
