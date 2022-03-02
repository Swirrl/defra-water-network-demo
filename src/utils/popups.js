import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

const getLastURLSegment = (url) =>{
  return url.split("/").pop();
};

const toTableCells = (displayProps) =>{
  return Object.entries(displayProps).map(([key, value]) => {
    return(
    `<tr>
       <th>${key}</th>
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

const hydroNodePropertiesToHTML = ({properties}) =>{
  const displayProps = {
    "ID": properties.id,
    "Category": getLastURLSegment(properties.hydroNodeCategory)};

  return popupTableHTML("Hydro Node", displayProps);
};

const watercourseLinkPropertiesToHTML = ({properties}) =>{
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

export const setupLayerPopups = (map) => {
  map.on("click", "hydroNodes", (e) => {
    e.originalEvent.preventDefault();
    const coords = e.features[0].geometry.coordinates;
    const text = hydroNodePropertiesToHTML(e.features[0]);

    new mapboxgl.Popup()
      .setLngLat(coords)
      .setHTML(text)
      .addTo(map);
  });

  map.on("click", "watercourseLinks", (e) => {
    if (e.originalEvent.defaultPrevented)  return;

    const coords = e.lngLat;
    const text = watercourseLinkPropertiesToHTML(e.features[0]);

    new mapboxgl.Popup()
      .setLngLat(coords)
      .setHTML(text)
      .addTo(map);
  });

  // Change cursor to a pointer when the mouse is over the feature layers
  map.on("mouseenter", "hydroNodes", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "watercourseLinks", () => {
    map.getCanvas().style.cursor = "";
  });


  map.on("mouseenter", "watercourseLinks", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "watercourseLinks", () => {
    map.getCanvas().style.cursor = "";
  });
};
