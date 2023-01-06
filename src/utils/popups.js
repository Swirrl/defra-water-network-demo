import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax

import { highlightNearestWatercourseLink } from "../utils/nearest-wc-link-to-site";
import { bristolFieldLabels, ensureHttps } from "./misc";
import {
  saveWatercourseLinkSiteAssociation,
  getURL,
  waterNetworkAPIBase,
  mergeFeatures,
} from "../utils/water-network-data";
import { bboxPolygon, getMapBoundingBox } from "./map";
import {
  tableHeader,
  tableCell,
  toTableCells,
  tableHTML,
  button,
  link,
} from "./html-strings.js";

const getLastURLSegment = (url) => {
  return url.split("/").pop();
};

const basicPopupTableHTML = (title, displayProps) => {
  return tableHTML(title, toTableCells(displayProps));
};

const hydroNodeCatchmentsLinks = (properties) => {
  const catchmentLinks = [];
  if (properties.riverCatchment) {
    catchmentLinks.push({
      text: "EA River Catchment",
      url:
        "https://environment.data.gov.uk/catchment-planning/WaterBody/" +
        properties.riverCatchment,
      style: "display:block;",
    });
  }

  if (properties.operationalCatchment) {
    catchmentLinks.push({
      text: "EA Operational Catchment",
      url:
        "https://environment.data.gov.uk/catchment-planning/OperationalCatchment/" +
        properties.operationalCatchment,
      style: "display:block;",
    });
  }

  if (properties.managementCatchment) {
    catchmentLinks.push({
      text: "EA Management Catchment",
      url:
        "https://environment.data.gov.uk/catchment-planning/ManagementCatchment/" +
        properties.managementCatchment,
      style: "display:block;",
    });
  }

  if (properties.riverBasinDistrict) {
    catchmentLinks.push({
      text: "EA River Basin District",
      url:
        "https://environment.data.gov.uk/catchment-planning/RiverBasinDistrict/" +
        properties.riverBasinDistrict,
      style: "display:block;",
    });
  }

  if (catchmentLinks.length > 0) {
    return catchmentLinks.map((p) => link(p.url, p.text, p.style)).join("");
  }
  return `<div>No EA Catchments Found</div>`;
};

const closePopup = () => {
  const popups = document.getElementsByClassName("mapboxgl-popup");
  for (const popup of popups) {
    popup.remove();
  }
};

const wcLinkPopupHTML = (title, displayProps) => {
  const upstreamWCLinkButton = button(
    `data-wc-link-id="${displayProps.ID}" id="upstream-button"`,
    "Show upstream watercourse links"
  );
  const downstreamWCLinkButton = button(
    `data-wc-link-id="${displayProps.ID}" id="downstream-button"`,
    "Show downstream watercourse links"
  );

  return `${basicPopupTableHTML(title, displayProps)}
          ${upstreamWCLinkButton}
          ${downstreamWCLinkButton}`;
};

const fitMapToFeatures = (map, features) => {
  var bounds = new mapboxgl.LngLatBounds();

  features.forEach((feature) => {
    if (feature.geometry.type === "LineString") {
      feature.geometry.coordinates.forEach((coords) => {
        bounds.extend(coords);
      });
    } else if (feature.geometry.type === "MultiLineString") {
      feature.geometry.coordinates.forEach((line) => {
        line.forEach((coords) => {
          bounds.extend(coords);
        });
      });
    }
  });

  map.fitBounds(bounds, { padding: 20 });
};

const getUpstream = async (id) => {
  const url = `${waterNetworkAPIBase}/collections/WatercourseLink/items/${id}/upstream`;
  return await getURL(url);
};
// TODO: catch 404s
const highlightUpstreamWatercourseLinks = async (id, map) => {
  await getUpstream(id).then(async (upstreamWatercourseLinks) => {
    closePopup();
    const renderedWcLinks = map.querySourceFeatures("watercourseLinks");
    const renderedHNs = map.querySourceFeatures("hydroNodes");

    const allWcLinks = mergeFeatures(upstreamWatercourseLinks, renderedWcLinks);

    map.getSource("watercourseLinks").setData(allWcLinks);
    map.getSource("hydroNodes").setData({
      type: "FeatureCollection",
      features: [...renderedHNs],
    });
    map.getSource("upstreamWatercourseLinks").setData(upstreamWatercourseLinks);

    fitMapToFeatures(map, allWcLinks.features);
    await map.once("idle");

    const mapBounds = getMapBoundingBox(map);
    const box = bboxPolygon(mapBounds);
    map.getSource("bbox").setData(box);
  });
};

const getDownstream = async (id) => {
  const url = `${waterNetworkAPIBase}/collections/WatercourseLink/items/${id}/downstream`;
  return await getURL(url);
};

const highlightDownstreamWatercourseLinks = async (id, map) => {
  await getDownstream(id).then(async (downstreamWatercourseLinks) => {
    closePopup();
    const renderedWcLinks = map.querySourceFeatures("watercourseLinks");
    const renderedHNs = map.querySourceFeatures("hydroNodes");
    const allWcLinks = mergeFeatures(
      downstreamWatercourseLinks,
      renderedWcLinks
    );

    map.getSource("watercourseLinks").setData(allWcLinks);
    map.getSource("hydroNodes").setData({
      type: "FeatureCollection",
      features: [...renderedHNs],
    });
    map
      .getSource("downstreamWatercourseLinks")
      .setData(downstreamWatercourseLinks);

    fitMapToFeatures(map, allWcLinks.features);
    await map.once("idle");

    const mapBounds = getMapBoundingBox(map);
    const box = bboxPolygon(mapBounds);
    map.getSource("bbox").setData(box);
  });
};

window.WCLinkSelectMode = null;
export const setWCLinkSelectMode = (val, setMapContext) => {
  setMapContext(val);
  window.WCLinkSelectMode = val;
};

const enableAssociateWatercourseLinkMode = (siteURI, setMapContext) => {
  // next watercourselink click gets associated
  closePopup();
  setWCLinkSelectMode(siteURI, setMapContext);
};

const nearbyWCLinkTableHTML = (nearestLinksResponse) => {
  if (nearestLinksResponse) {
    const { wcLinks, userSelected } = nearestLinksResponse;

    if (wcLinks && !userSelected) {
      const props = {};
      for (const link of wcLinks) {
        props[link.properties.id] = `${link.distanceFromSearchPoint}m`;
      }

      const heading = `<tr>${tableHeader("Watercourse Link ID")}${tableHeader(
        "Distance"
      )}`;
      const rows = Object.entries(props)
        .map(([key, value]) => {
          return ` <tr>
${tableCell(key)}
${tableCell(value)}
     </tr>`;
        })
        .join("");

      return tableHTML("Nearest Watercourse Links", [heading, rows].join(""));
    } else {
      return "";
    }
  } else {
    return "";
  }
};

const sitePopupHTML = (title, displayProps, url, nearestLinksResponse) => {
  const rawAPILink = link(url, "Site API endpoint");
  const associateWCLink = button(
    `data-site-uri="${displayProps.URI || url}" id="associate-wc-link-button"`,
    "Associate watercourse link"
  );

  return `${basicPopupTableHTML(title, displayProps)}
          ${nearbyWCLinkTableHTML(nearestLinksResponse)}
          ${rawAPILink}
          ${associateWCLink}`;
};

const hydroNodePropertiesToHTML = ({ properties }) => {
  const displayProps = {
    ID: properties.id,
  };

  if (properties.hydroNodeCategory) {
    displayProps["Category"] = getLastURLSegment(properties.hydroNodeCategory);
  }

  return `${basicPopupTableHTML("Hydro Node", displayProps)}
          ${hydroNodeCatchmentsLinks(properties)}`;
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

  return wcLinkPopupHTML("Watercourse Link", displayProps);
};

const sitePropertiesToHTML = ({ properties, source, nearestLinksResponse }) => {
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

  const displayProps = { Name: properties.label, URI: properties.uri };

  if (properties.flow) {
    displayProps["Latest complete flow reading"] = properties.flow;
  }

  if (nearestLinksResponse?.userSelected) {
    displayProps["Associated Watercourse Link"] =
      nearestLinksResponse.wcLinks[0].properties.id;
  }

  return sitePopupHTML(
    "Monitoring Site",
    displayProps,
    url,
    nearestLinksResponse
  );
};

const bristolSitePropertiesToHTML = ({ properties }) => {
  const latestRecordDateTime = new Date(properties.record.datetime);

  const displayProps = {
    Name: properties.label,
    "Site Id": properties.siteId,
    "Latest record datetime": `${latestRecordDateTime.toLocaleDateString()} ${latestRecordDateTime.toLocaleTimeString()}`,
  };

  for (const [reading, value] of Object.entries(properties.record)) {
    if (bristolFieldLabels[reading]) {
      displayProps[bristolFieldLabels[reading]] = value;
    }
  }

  return sitePopupHTML("Monitoring Site", displayProps, properties.apiUrl);
};

const getCoords = (event) => {
  return event.features[0].geometry.coordinates;
};

const newPopup = (coords, text, map, setMapContext) => {
  new mapboxgl.Popup().setLngLat(coords).setHTML(text).addTo(map);

  const associateWCLinkButton = document.getElementById(
    "associate-wc-link-button"
  );
  associateWCLinkButton?.addEventListener("click", (e) => {
    return enableAssociateWatercourseLinkMode(
      associateWCLinkButton.dataset.siteUri,
      setMapContext
    );
  });

  const upstreamButton = document.getElementById("upstream-button");
  upstreamButton?.addEventListener("click", async (e) => {
    return highlightUpstreamWatercourseLinks(
      upstreamButton.dataset.wcLinkId,
      map
    );
  });

  const downstreamButton = document.getElementById("downstream-button");
  downstreamButton?.addEventListener("click", async (e) => {
    return highlightDownstreamWatercourseLinks(
      downstreamButton.dataset.wcLinkId,
      map
    );
  });
};

export const setWCLinkHoverMode = (map, wcLinkID, val) => {
  if (wcLinkID) {
    if (val) {
      map.setFeatureState(
        {
          source: "watercourseLinks",
          id: wcLinkID,
        },
        { hover: val }
      );
    } else {
      map.removeFeatureState({
        source: "watercourseLinks",
        id: wcLinkID,
      });
    }
  }
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

export const setupLayerPopups = (map, setMapContext) => {
  map.on("click", "hydroNodes", (e) => {
    if (window.WCLinkSelectMode) return;
    if (e.originalEvent.defaultPrevented) return;
    e.originalEvent.preventDefault();

    const coords = getCoords(e);
    const text = hydroNodePropertiesToHTML(e.features[0]);

    newPopup(coords, text, map, setMapContext);
  });

  map.on("click", "watercourseLinks", (e) => {
    if (window.WCLinkSelectMode) return;
    if (e.originalEvent.defaultPrevented) return;
    e.originalEvent.preventDefault();

    const coords = e.lngLat;
    const text = watercourseLinkPropertiesToHTML(e.features[0]);

    newPopup(coords, text, map, setMapContext);
  });

  map.on("click", "bristolWaterQualitySites", async (e) => {
    if (e.originalEvent.defaultPrevented) return;
    e.originalEvent.preventDefault();
    const coords = getCoords(e);
    const site = e.features[0];

    const properties = site.properties;
    const response = await fetch(
      `${properties.apiUrl}&refine.datetime=${properties.latestRecordDate}`
    ).then((response) => response.json());

    // Some sites (possible legacy ones) have readings
    // taken at the same time spread out over multiple records
    const fields = response.records.map((record) => record.fields);
    const combinedFields = fields.reduce((acc, cur) => ({ ...acc, ...cur }));
    site.properties.record = combinedFields;

    // Workaround since Bristol sites don't have a URI like EA sites
    // so we use the site's api url as an identifier
    // for highlighting and assocating nearest wclink
    site.properties.uri = site.properties.apiUrl;

    const text = bristolSitePropertiesToHTML(site);
    newPopup(coords, text, map, setMapContext);
    await highlightNearestWatercourseLink(site, map);
  });

  for (const layer of [
    "biosysSites",
    "waterQualitySites",
    "riverLevelSites",
    "freshwaterSites",
    "riverFlowSites",
  ]) {
    map.on("click", layer, async (e) => {
      // don't open popups in select mode
      if (window.WCLinkSelectMode) return;

      if (e.originalEvent.defaultPrevented) return;
      e.originalEvent.preventDefault();

      const coords = getCoords(e);
      const site = e.features[0];

      if (layer === "riverFlowSites") {
        const siteEndpoint = ensureHttps(site.properties.uri);
        const flow = await getLatestFlowReadingInfo(siteEndpoint);
        site.properties.flow = flow;
      }

      const nearestLinksResponse = await highlightNearestWatercourseLink(
        site,
        map
      );
      site.nearestLinksResponse = nearestLinksResponse;
      const text = sitePropertiesToHTML(site);

      newPopup(coords, text, map, setMapContext);
    });
  }

  for (const layer of [
    "biosysSites",
    "waterQualitySites",
    "riverLevelSites",
    "riverFlowSites",
    "freshwaterSites",
    "bristolWaterQualitySites",
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

  // Setup WC link select mode -- highlight on hover
  let wcLinkID = null;

  map.on("mousemove", "watercourseLinks", (e) => {
    if (!window.WCLinkSelectMode) return;
    if (e.features.length === 0) return;

    setWCLinkHoverMode(map, wcLinkID, false);

    wcLinkID = e.features[0].id;
    setWCLinkHoverMode(map, wcLinkID, true);
  });

  map.on("mouseleave", "watercourseLinks", (e) => {
    if (!window.WCLinkSelectMode) return;

    setWCLinkHoverMode(map, wcLinkID, false);
    wcLinkID = null;
  });

  map.on("click", "watercourseLinks", async (e) => {
    if (!window.WCLinkSelectMode) return;

    const watercourseLink = e.features[0];
    const watercourseLinkId = watercourseLink?.properties.id;
    if (!watercourseLinkId) return;

    await saveWatercourseLinkSiteAssociation(
      watercourseLinkId,
      window.WCLinkSelectMode
    )
      .then(() => {
        map.getSource("highlightWatercourseLink").setData(watercourseLink);
      })
      .finally(() => {
        setWCLinkSelectMode(false, setMapContext);
        setWCLinkHoverMode(map, wcLinkID, false);
      });
  });
};
