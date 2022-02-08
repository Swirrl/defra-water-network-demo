import React, { useRef, useEffect, useState } from 'react';

import proj4 from 'proj4';
import './Search.css';

/* Copied from OS example:
   https://labs.os.uk/public/os-data-hub-examples/os-names-api/find-example-placename */

proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');

function Search(props) {
  const nameServiceUrl = 'https://api.os.uk/search/names/v1';

  const [results, setResults] = useState([])
  const [query, setQuery] = useState("");

  const OSapiKey = process.env.REACT_APP_OS_API_KEY;
  const OSplacesServiceBase = 'https://api.os.uk/search/names/v1/find' ;
  /* 'https://api.os.uk/search/places/v1/find' */

  const onSubmit = async (event) => {
    event.preventDefault();
    const url = OSplacesServiceBase +
                "?maxresults=15" +
                "&key=" + OSapiKey +
                "&query=" + query
    const places = await fetch(url).then(response => response.json());
    setResults(places.results);
  }

  const OSGridToLatLong = (coords) => {
    return proj4('EPSG:27700', 'EPSG:4326', coords);
  }

  const panMap = (entry) => {
    const coords = OSGridToLatLong([entry.GEOMETRY_X, entry.GEOMETRY_Y]);
    props.map.current.panTo(coords);
    props.map.current.setZoom(13);
    setResults([]);
  };

  const listItem = (entry) => {
    return (
      <li
        key={entry.ID}
        className="Search-results-list-item" >
      <a
        href="#"
        onClick={() => { panMap(entry) }}
      >{entry.NAME1}, {entry.REGION}</a>
      </li>);
  };

  const resultsToListItems = () => {
    return results.map((result) => {
      const entry = result.GAZETTEER_ENTRY;
      return listItem(entry)
  })};

  const resultsList = () => {
    return (
      results.length > 0 &&
      <div className="Search-results-list">
        {results.length === 15 && <em>Showing first 15 results</em>}
        <ul>{resultsToListItems()}</ul>
      </div>
    );
  };

  return (
    <div className="Search-container">
      <form action="/"
            method="get"
            autoComplete="off"
            onSubmit={onSubmit}>
        <label htmlFor="header-search">
          <span className="visually-hidden">Search for a place</span>
        </label>
        <input
          type="text"
          id="header-search"
          placeholder="Search for a place"
          name="s"
          className="Search-input"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="Search-submit-button">Go</button>
      </form>
      {resultsList()}
    </div>
  );
}

export default Search;
