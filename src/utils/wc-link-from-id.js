import {
  displayWaterNetworkFeaturesInMapViewport,
  getHydroNode,
  getWatercourseLink,
} from "../utils/water-network-data";
import { displayMonitoringSitesFeaturesInMapViewport } from "./monitoring-sites-data";

const getStartNodeCoords = async (watercourseLink) => {
  return getHydroNode(watercourseLink.properties.startNode).then(
    (hydroNode) => hydroNode.geometry.coordinates
  );
};

const centerWatercourseLink = async (watercourseLink, map) => {
  await getStartNodeCoords(watercourseLink).then((coords) => {
    map.setCenter(coords);
    map.setZoom(15);
  });
};

export const showWatercourseLink = async (watercourseLinkId, map) => {
  const watercourseLink = await getWatercourseLink(watercourseLinkId);

  await centerWatercourseLink(watercourseLink, map.current);
  await displayWaterNetworkFeaturesInMapViewport(map.current);
  await displayMonitoringSitesFeaturesInMapViewport(map.current);
  map.current.getSource("highlightWatercourseLink").setData(watercourseLink);
};
