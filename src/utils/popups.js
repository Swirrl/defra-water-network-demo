import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

import { highlighestNearestWatercourseLink } from "../utils/nearest-wc-link-to-site";

const getLastURLSegment = (url) =>{
  return url.split("/").pop();
};

const toTableCells = (displayProps) =>{
  return Object.entries(displayProps).map(([key, value]) => {
    return(
    `<tr>
       <th style="vertical-align: top">${key}</th>
       <td>${displayProps[key]}</td>
     </tr>`);
  }).join("");
};

const popupTableHTML = (title, displayProps) => {
  return (
    `<table>
       <caption style="font-weight: bold; caption-side: top">${title}</caption>
        ${toTableCells(displayProps)}
     </table>`);
};

const hydroNodePropertiesToHTML = ({properties}) => {
  const displayProps = {
    "ID": properties.id,
    "Category": getLastURLSegment(properties.hydroNodeCategory)};

  return popupTableHTML("Hydro Node", displayProps);
};

const watercourseLinkPropertiesToHTML = ({properties}) => {
  const displayProps = {
    "ID": properties.id,
  };

  if (properties.length) {
    displayProps["Length"] = properties.length;
  };

  if (properties.flowDirection) {
    displayProps["Flow direction"] = getLastURLSegment(properties.flowDirection);
  };

  if (properties.catchmentName) {
    displayProps["Catchment name"] = properties.catchmentName;
  };

  if (properties.catchmentId) {
    displayProps["Catchment ID"] = properties.catchmentId;
  }

  return popupTableHTML("Watercourse Link", displayProps);
};

const sitePropertiesToHTML = ({properties}) => {
  return popupTableHTML("Monitoring Site", {"Name": properties.label,
                                            "URI": properties.uri});
};

const getCoords = (event) => {
  return event.features[0].geometry.coordinates;
};

const newPopup = (coords, text, map) => {
 return new mapboxgl.Popup()
    .setLngLat(coords)
    .setHTML(text)
    .addTo(map);
};

export const setupLayerPopups = (map) => {
  map.on("click", "hydroNodes", (e) => {
    if (e.originalEvent.defaultPrevented) return;
    e.originalEvent.preventDefault();

    const coords = getCoords(e);
    const text = hydroNodePropertiesToHTML(e.features[0]);

    newPopup(coords, text, map);
  });

  map.on("click", "watercourseLinks", (e) => {
    if (e.originalEvent.defaultPrevented) return;
    e.originalEvent.preventDefault();

    const coords = e.lngLat;
    const text = watercourseLinkPropertiesToHTML(e.features[0]);

    newPopup(coords, text, map);
  });

  for (const layer of ["biosysSites",
                       "waterQualitySites",
                       "riverLevelSites",
                       "freshwaterSites"]) {
    map.on("click", layer, async (e) => {
      if (e.originalEvent.defaultPrevented) return;
      e.originalEvent.preventDefault();

      const coords = getCoords(e);
      const text = sitePropertiesToHTML(e.features[0]);

      newPopup(coords, text, map);
      await highlighestNearestWatercourseLink(coords, map);
    });
  }

  for (const layer of ["biosysSites",
                       "waterQualitySites",
                       "riverLevelSites",
                       "freshwaterSites",
                       "hydroNodes",
                       "watercourseLinks"]) {

    // Change cursor to a pointer when the mouse is over the feature layers
    map.on("mouseenter", layer, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", layer, () => {
      map.getCanvas().style.cursor = "";
    });
  }
};
