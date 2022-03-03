import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

import { displayWaterNetworkFeaturesInMapViewport } from "../utils/water-network-data";
import { displayMonitoringSitesFeaturesInMapViewport } from "../utils/monitoring-sites-data";
import { getOSNames } from "../utils/os-names";
import { OSGridToLatLng } from "../utils/coords";

import './Search.css';

function Search({map}) {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");

  const [show, setShow] = useState(true);
  const handleClose = () => {setShow(false);};
  const handleShow = () => {setShow(true);};

  const onSubmit = async (event) => {
    event.preventDefault();
    const places = await getOSNames(query);
    setResults(places.results);
  };

  const selectEntry = async (entry) => {
    const coords = OSGridToLatLng([entry.GEOMETRY_X, entry.GEOMETRY_Y]);
    map.current.setCenter(coords);
    map.current.setZoom(14);
    handleClose();
    setResults([]);
    await displayWaterNetworkFeaturesInMapViewport(map.current);
    await displayMonitoringSitesFeaturesInMapViewport(map.current);
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
      return listItem(entry);
    });
  };

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
              className="Search-button">Search ▶
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
