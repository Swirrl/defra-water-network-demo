import { OSGridToLatLng } from "../utils/coords";

const toFeature = (row) => {
  const [s, easting, northing, label] = row.split(",");
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: OSGridToLatLng([parseInt(easting), parseInt(northing)]),
    },
    properties: {
      uri: s,
      label: label,
    },
  };
};

const toFeatures = (csv) =>
  csv
    .split(/\r?\n/)
    .slice(1)
    .filter((row) => row.length > 0)
    .map(toFeature);

export const csvToGeoJSON = (csv) => {
  return {
    type: "FeatureCollection",
    features: toFeatures(csv),
  };
};
