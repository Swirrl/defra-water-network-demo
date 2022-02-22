import proj4 from 'proj4';

const OSapiKey = process.env.REACT_APP_OS_API_KEY;
const OSNamesServiceBase = 'https://api.os.uk/search/names/v1/find' ;

export async function getOSNames(query) {
  const url = OSNamesServiceBase +
        "?maxresults=15" +
        "&key=" + OSapiKey +
        "&query=" + query;
  const response = await fetch(url);
  return await response.json();
};

proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');

export function OSGridToLatLong(coords) {
  return proj4('EPSG:27700', 'EPSG:4326', coords);
};
