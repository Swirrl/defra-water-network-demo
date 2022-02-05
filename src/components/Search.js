import React, { useRef, useEffect, useState } from 'react';

import './Search.css';

function Search() {
  const nameServiceUrl = 'https://api.os.uk/search/names/v1';

  const [results, setResults] = useState([])
  const [query, setQuery] = useState("");

  const OSapiKey = process.env.REACT_APP_OS_API_KEY;
  const OSplacesServiceBase = 'https://api.os.uk/search/names/v1/find' ;
  /* 'https://api.os.uk/search/places/v1/find' */

  const onSubmit = async (event) => {
    event.preventDefault();
    const url = OSplacesServiceBase +
                "?maxresults=10" +
                "&key=" + OSapiKey +
                "&query=" + query
    const places = await fetch(url).then(response => response.json());
    setResults(places.results);
  }

  const resultsToListItems = () => {
    return results.map((result) => {
      const entry = result.GAZETTEER_ENTRY;
      // TODO: Make these clickable links, reverse geocode on click
      // and zoom map in to that area
      return (<li>{entry.NAME1}, {entry.REGION}</li>);
  })};

  const resultsList = () => {
      return results.length > 0 && resultsToListItems();
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
