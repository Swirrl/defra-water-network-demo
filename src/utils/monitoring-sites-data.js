import { getBboxCorners, getMapBoundingBox } from "../utils/map";
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

const riverFlowSitesQuery = ([
  [swEasting, swNorthing],
  [neEasting, neNorthing],
]) => {
  return `https://environment.data.gov.uk/hydrology/id/stations.csv?observedProperty=waterFlow&mineq-easting=${swEasting}&mineq-northing=${swNorthing}&maxeq-easting=${neEasting}&maxeq-northing=${neNorthing}&_projection=easting,northing,label`;
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

const bristolBaseUrl = `https://opendata.bristol.gov.uk/api/records/1.0/search/?dataset=surface-water-quality&q=&sort=datetime`;

const bristolWaterQualityQuery = (map) => {
  const { sw, nw, ne, se } = getBboxCorners(map);

  return (
    `${bristolBaseUrl}&facet=siteid&rows=30` +
    `&geofilter.polygon=(${sw.lat},${sw.lng}),` +
    `(${nw.lat},${nw.lng}),` +
    `(${ne.lat},${ne.lng}),` +
    `(${se.lat},${se.lng}),` +
    `(${sw.lat},${sw.lng})`
  );
};

const getRecordsForBWQSiteQuery = (siteId) => {
  return `${bristolBaseUrl}&refine.siteid=${siteId}`;
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

const setRiverFlowSitesInBoundingBox = async (map, corners) => {
  const query = riverFlowSitesQuery(corners);
  const csv = await fetch(query).then((response) => response.text());

  const sites = csvToGeoJSON(csv.replace(/"+/g, ""));
  map.getSource("riverFlowSites").setData(sites);
};

const setBristolWaterQualitySitesInBoundingBox = async (map) => {
  const query = bristolWaterQualityQuery(map);
  const response = await fetch(query).then((response) => response.json());
  const records = response.records;
  const siteIds = response.facet_groups[0].facets.map((facet) => facet.name);

  const latestRecords = [];
  for (const siteId of siteIds) {
    let latestRecord = records.find(
      (record) => record.fields.siteid === siteId
    );

    if (latestRecord) {
      latestRecords.push(latestRecord);
    } else {
      const recordsForSiteQuery = getRecordsForBWQSiteQuery(siteId);
      const response = await fetch(recordsForSiteQuery).then((response) =>
        response.json()
      );
      const record = response.records[0];
      latestRecords.push(record);
    }
  }

  const bristolSites = {
    type: "FeatureCollection",
    features: latestRecords.map((record) => ({
      geometry: record.geometry,
      properties: {
        label: record.fields.sitename,
        siteId: record.fields.siteid,
        apiUrl: getRecordsForBWQSiteQuery(record.fields.siteid),
        latestRecordDate: record.fields.datetime.split("T")[0],
      },
    })),
  };

  map.getSource("bristolWaterQualitySites").setData(bristolSites);
};

export const displayMonitoringSitesFeaturesInMapViewport = async (map) => {
  const mapBounds = getMapBoundingBox(map);
  const corners = mapBoundsToEastingNorthing(mapBounds);

  await setSitesInBoundingBox(map, corners, "biosysSites");
  await setSitesInBoundingBox(map, corners, "waterQualitySites");
  await setSitesInBoundingBox(map, corners, "riverLevelSites");
  await setSitesInBoundingBox(map, corners, "freshwaterSites");
  await setRiverFlowSitesInBoundingBox(map, corners);
  await setBristolWaterQualitySitesInBoundingBox(map);
};
