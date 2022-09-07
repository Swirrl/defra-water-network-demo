import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax

import { highlighestNearestWatercourseLink } from "../utils/nearest-wc-link-to-site";

const getLastURLSegment = (url) => {
  return url.split("/").pop();
};

const toTableCells = (displayProps) => {
  return Object.entries(displayProps)
    .map(([key, value]) => {
      return `<tr>
       <th style="vertical-align: top">${key}</th>
       <td>${value}</td>
     </tr>`;
    })
    .join("");
};

const popupTableHTML = (title, displayProps, url) => {
  let link = "";

  if (url) {
    link = `<tr><a target="_blank" href=${url}>Site API endpoint</a></tr>`;
  }

  return `<table>
       <caption style="font-weight: bold; caption-side: top">${title}</caption>
        ${toTableCells(displayProps)}
     </table>
     ${link}`;
};

const hydroNodePropertiesToHTML = ({ properties }) => {
  const displayProps = {
    ID: properties.id,
    Category: getLastURLSegment(properties.hydroNodeCategory),
  };

  return popupTableHTML("Hydro Node", displayProps);
};

const watercourseLinkPropertiesToHTML = ({ properties }) => {
  const displayProps = {
    ID: properties.id,
  };

  if (properties.length) {
    displayProps["Length"] = properties.length;
  }

  if (properties.flowDirection) {
    displayProps["Flow direction"] = getLastURLSegment(
      properties.flowDirection
    );
  }

  if (properties.catchmentName) {
    displayProps["Catchment name"] = properties.catchmentName;
  }

  if (properties.catchmentId) {
    displayProps["Catchment ID"] = properties.catchmentId;
  }

  return popupTableHTML("Watercourse Link", displayProps);
};

const sitePropertiesToHTML = ({ properties, source }) => {
  let url;
  let ecologyEndpoint = "https://environment.data.gov.uk/ecology/api/v1/sites/";

  if (source === "biosysSites") {
    const siteId = getLastURLSegment(properties.uri);
    url = `${ecologyEndpoint}http%3A%2F%2Fenvironment.data.gov.uk%2Fecology%2Fsite%2Fbio%2F${siteId}`;
  } else if (source === "freshwaterSites") {
    const siteId = getLastURLSegment(properties.uri);
    url = `${ecologyEndpoint}http%3A%2F%2Fenvironment.data.gov.uk%2Fecology%2Fsite%2Ffish%2F${siteId}`;
  } else {
    url = properties.uri;
  }

  return popupTableHTML(
    "Monitoring Site",
    { Name: properties.label, URI: properties.uri },
    url
  );
};

const getCoords = (event) => {
  return event.features[0].geometry.coordinates;
};

const newPopup = (coords, text, map) => {
  return new mapboxgl.Popup().setLngLat(coords).setHTML(text).addTo(map);
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

  for (const layer of [
    "biosysSites",
    "waterQualitySites",
    "riverLevelSites",
    "freshwaterSites",
  ]) {
    map.on("click", layer, async (e) => {
      if (e.originalEvent.defaultPrevented) return;
      e.originalEvent.preventDefault();

      const coords = getCoords(e);
      const text = sitePropertiesToHTML(e.features[0]);

      newPopup(coords, text, map);
      await highlighestNearestWatercourseLink(coords, map);
    });
  }

  for (const layer of [
    "biosysSites",
    "waterQualitySites",
    "riverLevelSites",
    "freshwaterSites",
    "hydroNodes",
    "watercourseLinks",
  ]) {
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
