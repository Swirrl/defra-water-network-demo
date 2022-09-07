import proj4 from "proj4";

/* proj4 config lifted from OS example:
   https://labs.os.uk/public/os-data-hub-examples/os-names-api/find-example-placename */

proj4.defs(
  "EPSG:27700",
  "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs"
);

export const OSGridToLatLng = (coords) => {
  return proj4("EPSG:27700", "EPSG:4326", coords);
};

export const latLngToOSGrid = (coords) => {
  return proj4("EPSG:4326", "EPSG:27700", coords);
};
