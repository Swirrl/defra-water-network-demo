import { waterNetworkAPIBase, getURL } from "../utils/water-network-data";

const getNearestWCLinkToPoint = async (coords) => {
  const url =
    waterNetworkAPIBase +
    "/collections/WatercourseLink/items" +
    "?point=" +
    coords.join(",");

  return await getURL(url);
};

export const highlighestNearestWatercourseLink = async (coords, map) => {
  await getNearestWCLinkToPoint(coords).then((watercourseLink) => {
    map.getSource("highlightWatercourseLink").setData(watercourseLink);
  });
};
