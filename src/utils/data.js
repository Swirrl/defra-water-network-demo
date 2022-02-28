const waterNetworkAPIBase = "https://defra-water-network-prod.publishmydata.com/water-network/api/v1";
const waterNetworkAPIKey = process.env.REACT_APP_WATER_NETWORK_API_KEY;

async function getURL(url) {
  const headers = {
    "Authorization": `Basic ${waterNetworkAPIKey}`
  };

  return await fetch(url, {method: "GET",
                           headers: headers
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

  let response = await getURL(url);
  return getBBoxPages(response);
}
