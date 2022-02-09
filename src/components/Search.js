import React, { useRef, useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

import proj4 from 'proj4';
import './Search.css';

/* Copied from OS example:
   https://labs.os.uk/public/os-data-hub-examples/os-names-api/find-example-placename */

proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');

function Search({map}) {
  const nameServiceUrl = 'https://api.os.uk/search/names/v1';

  const [results, setResults] = useState([])
  const [query, setQuery] = useState("");

  const [show, setShow] = useState(true);
  const handleClose = () => {setShow(false);};
  const handleShow = () => {setShow(true);};

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

  const selectEntry = (entry) => {
    const coords = OSGridToLatLong([entry.GEOMETRY_X, entry.GEOMETRY_Y]);
    map.current.setCenter(coords);
    map.current.setZoom(14);
    handleClose();
    setResults([]);
  };

  const listItem = (entry) => {
    return (
      <li
        key={entry.ID}
        className="Search-results-list-item" >
        <Button variant="link"
                onClick={() => { selectEntry(entry) }}
                className="p-0 mb-2">
          {entry.NAME1}, {entry.REGION}
        </Button>
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
      <div className="Search-results-list mt-3">
        {results.length === 15 && <em>Showing first 15 results</em>}
        <ul className="mt-2">{resultsToListItems()}</ul>
      </div>
    );
  };

  return (
    <>
      <Button variant="primary"
              onClick={handleShow}
              className="CollapsiblePane-button">Search ▶
      </Button>
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Water Network API</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>

          <Form onSubmit={onSubmit}>
            <Form.Group controlId="search-query" className="mb-3">
              <Form.Label visuallyHidden="true">Search for a place</Form.Label>
              <Form.Control type="text"
                            placeholder="Search for a place"
                            onChange={(e) => setQuery(e.target.value)}/>
            </Form.Group>
            <Button variant="primary" type="submit">Submit</Button>
            {resultsList()}
          </Form>

        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Search;
