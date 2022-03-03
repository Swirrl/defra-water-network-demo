import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { displayWaterNetworkFeaturesInMapViewport } from "../utils/water-network-data";
import { displayMonitoringSitesFeaturesInMapViewport } from "../utils/monitoring-sites-data";
import { debounce } from "../utils/misc";

import './SearchHereButton.css';

function SearchHereButton ({map}) {
  const renderMapItems = async () => {
    await displayWaterNetworkFeaturesInMapViewport(map.current);
    await displayMonitoringSitesFeaturesInMapViewport(map.current);
  };

  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize

    map.current.on("zoom", debounce((e) => {
      if (map.current.getZoom() >= 14) {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    }, 60))
  })


  const renderTooltip = () => (
    <Tooltip id="tooltip-disabled">
      Zoom in more to enable searching for all features within the currently visible portion of the map
    </Tooltip>
  )

  return (
    // <OverlayTrigger
    //   placement="right"
    //   overlay={renderTooltip}>
    //   <span className="d-inline-block">
    //     <Button style={isDisabled ? { pointerEvents: 'none' } : {}}
    //             disabled={isDisabled}
    //             variant="secondary"
    //             className="SearchHereButton">
    //       Search Here
    //     </Button>
    //   </span>
    // </OverlayTrigger>

    <Button style={isDisabled ? { pointerEvents: 'none' } : {}}
            onClick={renderMapItems}
            disabled={isDisabled}
            variant="secondary"
            className="SearchHereButton">
      Search Here
    </Button>


    //   <OverlayTrigger
    // placement="right"
    // delay={{ show: 250, hide: 400 }}
    // overlay={renderTooltip}
    //   >
    //   <Button variant="success">Hover me to see</Button>
    //   </OverlayTrigger>

    //   <Button variant="secondary"
    //           onClick={renderMapItems}
    // className="SearchHereButton"
    // disabled={map.current.getZoom() <= 14}>
    //     Search Here
    //   </Button>
  );
}

export default SearchHereButton;
