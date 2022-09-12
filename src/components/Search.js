import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import { displayWaterNetworkFeaturesInMapViewport } from "../utils/water-network-data";
import { displayMonitoringSitesFeaturesInMapViewport } from "../utils/monitoring-sites-data";
import { getOSNames } from "../utils/os-names";
import { OSGridToLatLng } from "../utils/coords";

import "./Search.css";
import { useNavigate } from "react-router-dom";
import { unhighlightWatercourseLink } from "../utils/nearest-wc-link-to-site";
import { showWatercourseLink } from "../utils/wc-link-from-id";

function Search({ map, initialShow, initialError }) {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [show, setShow] = useState(true);
  const [key, setKey] = useState("place");
  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => {
    setShow(true);
  };

  const navigate = useNavigate();

  const onSubmitPlace = async (event) => {
    event.preventDefault();
    if (query) {
      const places = await getOSNames(query);
      setResults(places.results);
    }
  };

  useEffect(() => {
    setShow(initialShow);
  }, [initialShow]);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
      setKey("watercourse-link");
    }
  }, [initialError]);

  const onSubmitWL = async (event) => {
    event.preventDefault();
    if (query) {
      showWatercourseLink(query, map)
        .then(() => {
          setError(null);
          setShow(false);
          navigate("/watercourse-link/" + query);
        })
        .catch((error) => setError(error));
    }
  };

  const selectEntry = async (entry) => {
    const coords = OSGridToLatLng([entry.GEOMETRY_X, entry.GEOMETRY_Y]);
    map.current.setCenter(coords);
    map.current.setZoom(14);
    handleClose();
    setResults([]);
    navigate("/");
    unhighlightWatercourseLink(map.current);
    await displayWaterNetworkFeaturesInMapViewport(map.current);
    await displayMonitoringSitesFeaturesInMapViewport(map.current);
  };

  const listItem = (entry) => {
    return (
      <li key={entry.ID} className="Search-results-list-item">
        <Button
          variant="link"
          onClick={() => {
            selectEntry(entry);
          }}
          className="p-0 mb-2"
        >
          {entry.NAME1}, {entry.REGION}
        </Button>
      </li>
    );
  };

  const resultsToListItems = () => {
    return results.map((result) => {
      const entry = result.GAZETTEER_ENTRY;
      return listItem(entry);
    });
  };

  const resultsList = () => {
    return (
      results.length > 0 && (
        <div className="Search-results-list mt-3">
          {results.length === 15 && <em>Showing first 15 results</em>}
          <ul className="mt-2">{resultsToListItems()}</ul>
        </div>
      )
    );
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow} className="Search-button">
        Search ▶
      </Button>
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Water Network API</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Tabs
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="Search-tabs"
          >
            <Tab eventKey="place" title="Place">
              <Form onSubmit={onSubmitPlace}>
                <Form.Group controlId="search-query" className="mb-3">
                  <Form.Label visuallyHidden="true">
                    Search for a place
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search for a place"
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={query ? false : true}
                >
                  Submit
                </Button>
                {resultsList()}
              </Form>
            </Tab>
            <Tab eventKey="watercourse-link" title="Watercourse Link">
              <Form onSubmit={onSubmitWL}>
                <Form.Group controlId="wcl-query" className="mb-3">
                  <Form.Label visuallyHidden="true">
                    Search for a Watercourse Link
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search for a Watercourse Link"
                    onChange={(e) => setQuery(e.target.value)}
                    isInvalid={error}
                  />
                  <Form.Control.Feedback type="invalid">
                    No results found for given ID.
                  </Form.Control.Feedback>
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={query ? false : true}
                >
                  Submit
                </Button>
                {resultsList()}
              </Form>
            </Tab>
          </Tabs>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Search;
