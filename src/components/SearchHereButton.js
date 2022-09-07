import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import { displayWaterNetworkFeaturesInMapViewport } from "../utils/water-network-data";
import { displayMonitoringSitesFeaturesInMapViewport } from "../utils/monitoring-sites-data";
import { debounce } from "../utils/misc";

import "./SearchHereButton.css";

function SearchHereButton({ map }) {
  const renderMapItems = async () => {
    await displayWaterNetworkFeaturesInMapViewport(map.current);
    await displayMonitoringSitesFeaturesInMapViewport(map.current);
  };

  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize

    map.current.on(
      "zoom",
      debounce((e) => {
        if (map.current.getZoom() >= 14) {
          setDisabled(false);
        } else {
          setDisabled(true);
        }
      }, 60)
    );
  });

  const renderTooltip = () => (
    <Tooltip id="tooltip-disabled">
      Zoom in more to enable searching for all features within the currently
      visible portion of the map
    </Tooltip>
  );

  const renderButton = () => (
    <Button
      style={isDisabled ? { pointerEvents: "none" } : {}}
      onClick={renderMapItems}
      disabled={isDisabled}
      variant="secondary"
      className={isDisabled ? "" : "SearchHereButton"}
    >
      Search Here
    </Button>
  );

  return isDisabled ? (
    <OverlayTrigger overlay={renderTooltip()} placement="right">
      <div
        className="d-inline-block SearchHereButton-tooltip-overlay"
        style={isDisabled ? { cursor: "not-allowed" } : {}}
      >
        {renderButton()}
      </div>
    </OverlayTrigger>
  ) : (
    renderButton()
  );
}

export default SearchHereButton;
