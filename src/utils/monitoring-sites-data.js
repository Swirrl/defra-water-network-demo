import { getMapBoundingBox } from "../utils/map";
import { latLngToOSGrid } from "../utils/coords";
import { csvToGeoJSON } from "../utils/geojson";

const requestURL = (query) => {
  return (
    `https://environment-test.data.gov.uk/` +
    `linked-data/sparql?query=${encodeURIComponent(query)}`
  );
};

const bboxFilter = ([swEasting, swNorthing], [neEasting, neNorthing]) => {
  return `
    FILTER(?easting <= ${neEasting} && ?easting >= ${swEasting} &&
           ?northing <= ${neNorthing} && ?northing >= ${swNorthing})`;
};

const biosysSitesQuery = ([sw, ne]) => {
  return (
    `
    SELECT ?s ?easting ?northing ?label WHERE
    { ?s a <http://environment.data.gov.uk/ecology/biosys/def/Site> ;
           <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> ?easting ;
           <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> ?northing ;
           <http://www.w3.org/2000/01/rdf-schema#label> ?label .` +
    bboxFilter(sw, ne) +
    `}`
  );
};

const waterQualitySitesQuery = ([sw, ne]) => {
  return (
    `
    SELECT ?s ?easting ?northing ?label WHERE
      { ?s a <http://environment.data.gov.uk/water-quality/def/sampling-point/SamplingPoint> ;
        <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> ?easting ;
        <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> ?northing ;
        <http://www.w3.org/2000/01/rdf-schema#label> ?label .` +
    bboxFilter(sw, ne) +
    `}`
  );
};

const riverLevelSitesQuery = ([sw, ne]) => {
  return (
    `
    SELECT ?s ?easting ?northing ?label WHERE {
    GRAPH <http://environment.data.gov.uk/linked-data/graph/river-level-monitoring-stations> {
    { ?s <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> ?easting ;
         <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> ?northing ;
         <http://www.w3.org/2000/01/rdf-schema#label> ?label .` +
    bboxFilter(sw, ne) +
    `}}}`
  );
};

const fishPopulationFreshwaterSites = ([sw, ne]) => {
  return (
    `
    SELECT DISTINCT ?s ?easting ?northing ?label WHERE
    { ?s a <http://environment.data.gov.uk/ecology/def/FishFreshwaterSite> ;
           <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> ?easting ;
           <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> ?northing ;
           <http://www.w3.org/2000/01/rdf-schema#label> ?label .` +
    bboxFilter(sw, ne) +
    `}`
  );
};

const getSitesInBoundingBox = async (query) => {
  const url = requestURL(query);
  const csv = await fetch(url).then((response) => response.text());
  return csvToGeoJSON(csv);
};

const mapBoundsToEastingNorthing = ([swLng, swLat, nwLng, neLat]) => {
  return [latLngToOSGrid([swLng, swLat]), latLngToOSGrid([nwLng, neLat])];
};

const queryTemplates = {
  biosysSites: biosysSitesQuery,
  waterQualitySites: waterQualitySitesQuery,
  riverLevelSites: riverLevelSitesQuery,
  freshwaterSites: fishPopulationFreshwaterSites,
};

const getQuery = (layer, corners) => {
  const queryTemplate = queryTemplates[layer];
  return queryTemplate(corners);
};

const setSitesInBoundingBox = async (map, corners, layer) => {
  const query = getQuery(layer, corners);
  return await getSitesInBoundingBox(query).then((sites) => {
    map.getSource(layer).setData(sites);
  });
};

export const displayMonitoringSitesFeaturesInMapViewport = async (map) => {
  const mapBounds = getMapBoundingBox(map);
  const corners = mapBoundsToEastingNorthing(mapBounds);

  await setSitesInBoundingBox(map, corners, "biosysSites");
  await setSitesInBoundingBox(map, corners, "waterQualitySites");
  await setSitesInBoundingBox(map, corners, "riverLevelSites");
  await setSitesInBoundingBox(map, corners, "freshwaterSites");
};
