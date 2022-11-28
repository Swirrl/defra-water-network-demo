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
  const nextNearest = wcLinks[1];
  let distanceBetweenNearestTwo = Infinity;
  if (nearest && nextNearest) {
    distanceBetweenNearestTwo =
      wcLinks[1].distanceFromSearchPoint - nearest.distanceFromSearchPoint;
  }

  if (distanceBetweenNearestTwo > 20) {
    return { wcLinks: wcLinks, certainty: "certain" };
  } else if (distanceBetweenNearestTwo > 5) {
    return { wcLinks: wcLinks, certainty: "probable" };
  } else {
    return { wcLinks: wcLinks, certainty: "ambiguous" };
  }
};

const getUserAssociatedWCLink = async (siteURI) => {
  const url =
    waterNetworkBaseURL +
    "/retrieve-user-associated-watercourse-link" +
    `?site_uri=${encodeURIComponent(siteURI)}`;

  const result = await fetch(url, { method: "GET", headers: headers });

  if (result.status === 404) {
    return null;
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
    certaintyToColour[wcLink.certainty] || "#06a516"
  );
  map.getSource("highlightWatercourseLink").setData(wcLink);
};

export const highlightNearestWatercourseLink = async (site, map) => {
  const siteURI = site.properties.uri;
  const userAssociatedWCLink = await getUserAssociatedWCLink(siteURI);

  let allLinks = null;
  let wcLink = null;
  let userSelected = false;

  if (userAssociatedWCLink?.status === "No watercourse link") {
    unhighlightWatercourseLink(map);
    return null;
  } else if (userAssociatedWCLink) {
    wcLink = { ...userAssociatedWCLink, certainty: "certain" };
    allLinks = { wcLinks: [userAssociatedWCLink] };
    userSelected = true;
  } else {
    const coords = site.geometry.coordinates;
    allLinks = await getNearestWCLinkToPoint(coords);
    wcLink = { ...allLinks.wcLinks[0], certainty: allLinks.certainty };
  }

  setHighlightedWcLink(map, wcLink);
  return { wcLinks: allLinks.wcLinks, userSelected: userSelected };
};
