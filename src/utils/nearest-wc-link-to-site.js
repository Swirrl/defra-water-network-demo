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
    coords.join(",");

  return await getURL(url);
};

const getUserAssociatedWCLink = async (siteURI) => {
  const url =
    waterNetworkBaseURL +
    "/retrieve-user-associated-watercourse-link" +
    `?site_uri=${encodeURIComponent(siteURI)}`;

  return await fetch(url, { method: "GET", headers: headers }).then((r) => {
    if (r.status === 404) {
      return;
    } else {
      return r.json();
    }
  });
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

  map.getSource("highlightWatercourseLink").setData(wcLink);
};
