import {
  waterNetworkAPIBase,
  waterNetworkBaseURL,
  getURL,
  headers,
} from "../utils/water-network-data";
import { unhighlightWatercourseLink } from "../utils/map";

const getNearestWCLinkToPoint = async (coords) => {
  const url =
    waterNetworkAPIBase +
    "/collections/WatercourseLink/items" +
    "?point=" +
    coords.join(",") +
    "&multiple=true";

  const wcLinkResponse = await getURL(url);
  const wcLinks = wcLinkResponse.features;
  const nearest = wcLinks[0];
  const distanceBetweenNearestTwo =
    wcLinks[1].distanceFromSearchPoint - nearest.distanceFromSearchPoint;

  if (distanceBetweenNearestTwo > 20) {
    return { ...nearest, certainty: "certain" };
  } else if (distanceBetweenNearestTwo > 5) {
    return { ...nearest, certainty: "probable" };
  } else {
    return { ...nearest, certainty: "ambiguous" };
  }
};

const getUserAssociatedWCLink = async (siteURI) => {
  const url =
    waterNetworkBaseURL +
    "/retrieve-user-associated-watercourse-link" +
    `?site_uri=${encodeURIComponent(siteURI)}`;

  const result = await fetch(url, { method: "GET", headers: headers });

  if (result.status === 404) {
    return;
  } else {
    return await result.json();
  }
};

const setHighlightedWcLink = (map, wcLink) => {
  const certaintyToColour = {
    certain: "#06a516",
    probable: "#ffec44",
    ambiguous: "#9949cc",
  };
  map.setPaintProperty(
    "highlightWatercourseLink",
    "line-color",
    certaintyToColour[wcLink.certainty]
  );
  map.getSource("highlightWatercourseLink").setData(wcLink);
};

export const highlightNearestWatercourseLink = async (site, map) => {
  const siteURI = site.properties.uri;
  const userAssociatedWCLink = await getUserAssociatedWCLink(siteURI);

  let wcLink = null;

  if (userAssociatedWCLink?.status === "No watercourse link") {
    unhighlightWatercourseLink(map);
    return;
  } else if (userAssociatedWCLink) {
    wcLink = userAssociatedWCLink;
  } else {
    const coords = site.geometry.coordinates;
    wcLink = await getNearestWCLinkToPoint(coords);
  }

  setHighlightedWcLink(map, wcLink);
};
