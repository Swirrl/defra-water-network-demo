import { getMapBoundingBox } from "../utils/map";
import { latLngToOSGrid } from "../utils/coords";
import { csvToGeoJSON } from "../utils/geojson";

const requestURL = (query) => {
  return `https://environment-test.data.gov.uk/` +
    `linked-data/sparql?query=${encodeURIComponent(query)}`;
};

const bboxFilter = ([swEasting, swNorthing], [neEasting, neNorthing]) => {
  return `
    FILTER(?easting <= ${neEasting} && ?easting >= ${swEasting} &&
           ?northing <= ${neNorthing} && ?northing >= ${swNorthing})`;
};

const biosysSitesQuery = ([sw, ne]) => {
  return `
    SELECT ?s ?easting ?northing ?label WHERE
    { ?s a <http://environment.data.gov.uk/ecology/biosys/def/Site> ;
           <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> ?easting ;
           <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> ?northing ;
           <http://www.w3.org/2000/01/rdf-schema#label> ?label .` +
    bboxFilter(sw, ne) +
    `}`;
};

const waterQualitySitesQuery = ([sw, ne]) => {
  return `
    SELECT ?s ?easting ?northing ?label WHERE
      { ?s a <http://environment.data.gov.uk/water-quality/def/sampling-point/SamplingPoint> ;
        <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> ?easting ;
        <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> ?northing ;
        <http://www.w3.org/2000/01/rdf-schema#label> ?label .` +
    bboxFilter(sw, ne) +
    `}`;
};

const riverLevelSitesQuery = ([sw, ne]) => {
  return `
    SELECT ?s ?easting ?northing ?label WHERE
    GRAPH <http://environment.data.gov.uk/linked-data/graph/river-level-monitoring-stations> {
    { ?s <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> ?easting ;
         <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> ?northing ;
         <http://www.w3.org/2000/01/rdf-schema#label> ?label .` +
    bboxFilter(sw, ne) +
    `}}`;
};

const fishPopulationFreshwaterSites = ([sw, ne]) => {
  return `
    SELECT DISTINCT ?s ?easting ?northing ?label WHERE
    { ?s a <http://environment.data.gov.uk/ecology/def/FishFreshwaterSite> ;
           <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> ?easting ;
           <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> ?northing ;
           <http://www.w3.org/2000/01/rdf-schema#label> ?label .` +
    bboxFilter(sw, ne) +
    `}`;
};

const displayAllMonitoringSites = async (easting, northing) => {
  console.log("display??");
};

const getSitesInBoundingBox = async (query) => {
  const url = requestURL(query);
  // const basicAuth = process.env.REACT_APP_DEFRA_PMD_BASIC_AUTH_CREDS;
  // const headers = {
  //   Authorization: `Basic ${btoa(basicAuth)}`
  // };
  const csv = await fetch(url).then(response => response.text());
  return csvToGeoJSON(csv);
};

const mapBoundsToEastingNorthing = ([swLng, swLat, nwLng ,neLat]) => {
  return [latLngToOSGrid([swLng, swLat]), latLngToOSGrid([nwLng, neLat])];
};

export const displayMonitoringSitesFeaturesInMapViewport = async (map) => {
  const mapBounds = getMapBoundingBox(map);
  const corners = mapBoundsToEastingNorthing(mapBounds);

  await getSitesInBoundingBox(biosysSitesQuery(corners))
    .then((sites) => {
      map.getSource("biosysSites").setData(sites);
    });

  // await getFeaturesInBoundingBox("WatercourseLink", mapBounds)
  //   .then((watercourseLinks) => {
  //     map.getSource("watercourseLinks").setData(watercourseLinks);
  //   });
};
