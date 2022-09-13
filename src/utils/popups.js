import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax

import { highlightNearestWatercourseLink } from "../utils/nearest-wc-link-to-site";
import { ensureHttps } from "./misc";

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

const basicPopupTableHTML = (title, displayProps) => {
  return `<table>
       <caption style="font-weight: bold; caption-side: top">${title}</caption>
        ${toTableCells(displayProps)}
     </table>`;
};

const closePopup = () => {
  const popups = document.getElementsByClassName("mapboxgl-popup");
  for (const popup of popups) {
    popup.remove();
  }
};

window.WCLinkSelectMode = false;
const setWCLinkSelectMode = (val) => {
  window.WCLinkSelectMode = val;
};

const associateWatercourseLink = () => {
  closePopup();
  setWCLinkSelectMode(true);
  // next watercourselink click gets associated
};

const sitePopupHTML = (title, displayProps, url) => {
  const rawAPILink = `<a target="_blank" href=${url}>Site API endpoint</a>`;
  const associateWCLink = `<button class="btn btn-outline-secondary btn-sm mt-2"
                                   id="associate-wc-link-button"
                           >Associate watercourse link</button>`;

  return `${basicPopupTableHTML(title, displayProps)}
          ${rawAPILink}
          ${associateWCLink}`;
};

const hydroNodePropertiesToHTML = ({ properties }) => {
  const displayProps = {
    ID: properties.id,
    Category: getLastURLSegment(properties.hydroNodeCategory),
  };

  return basicPopupTableHTML("Hydro Node", displayProps);
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

  return basicPopupTableHTML("Watercourse Link", displayProps);
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

  return sitePopupHTML(
    "Monitoring Site",
    { Name: properties.label, URI: properties.uri },
    url
  );
  const displayProps = { Name: properties.label, URI: properties.uri };

  if (properties.flow) {
    displayProps["Latest complete flow reading"] = properties.flow;
  }

  return popupTableHTML("Monitoring Site", displayProps, url);
};

const getCoords = (event) => {
  return event.features[0].geometry.coordinates;
};

const newPopup = (coords, text, map) => {
  new mapboxgl.Popup().setLngLat(coords).setHTML(text).addTo(map);

  const button = document.getElementById("associate-wc-link-button");
  button?.addEventListener("click", associateWatercourseLink);
};

const getLatestCompleteReading = (readings) => {
  for (let i = 1; i <= readings.items.length; i++) {
    if (readings.items[readings.items.length - i].completeness === "Complete") {
      return readings.items[readings.items.length - i];
    }
  }
};

const getLatestFlowReadingInfo = async (url) => {
  const measures = await fetch(`${url}/measures`).then((response) =>
    response.json()
  );

  // The latest reading can be "incomplete" and have no value
  // So we're getting the readings from the last week and getting the latest "complete" one
  const today = new Date();
  const lastWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 7
  )
    .toJSON()
    .slice(0, 10);
  const readingsEndpoint = ensureHttps(
    `${measures.items[0]["@id"]}/readings?mineq-date=${lastWeek}`
  );
  const readings = await fetch(readingsEndpoint).then((response) =>
    response.json()
  );
  const readingUnit = measures.items[0].unitName;
  const reading = getLatestCompleteReading(readings);

  return `${reading.value} ${readingUnit} - ${reading.date}`;
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

  map.on("click", "riverFlowSites", async (e) => {
    if (e.originalEvent.defaultPrevented) return;
    e.originalEvent.preventDefault();
    const coords = getCoords(e);
    const feature = e.features[0];

    const siteEndpoint = ensureHttps(feature.properties.uri);
    const flow = await getLatestFlowReadingInfo(siteEndpoint);
    feature.properties.flow = flow;

    const text = sitePropertiesToHTML(feature);
    newPopup(coords, text, map);
    await highlightNearestWatercourseLink(coords, map);
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
      await highlightNearestWatercourseLink(coords, map);
    });
  }

  for (const layer of [
    "biosysSites",
    "waterQualitySites",
    "riverLevelSites",
    "riverFlowSites",
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
