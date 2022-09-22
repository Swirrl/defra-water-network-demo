import { useState } from "react";

import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import "./LayerToggles.css";

function LayerToggles({ map }) {
  const [biosysChecked, setBiosysChecked] = useState(true);
  const [waterQualityChecked, setWaterQualityChecked] = useState(true);
  const [riverLevelChecked, setRiverLevelChecked] = useState(true);
  const [riverFlowChecked, setRiverFlowChecked] = useState(true);
  const [freshwaterChecked, setFreshwaterChecked] = useState(true);
  const [hydroNodesChecked, setHydroNodes] = useState(true);
  const [watercourseLinksChecked, setWatercourseLinks] = useState(true);

  const [isExpanded, setExpanded] = useState(true);
  const [buttonSymbol, setButtonSymbol] = useState("◀");

  const toggleExpanded = () => {
    setExpanded(!isExpanded);
    const symbol = isExpanded ? "▶" : "◀";
    setButtonSymbol(symbol);
  };

  const layersToSetters = {
    biosysSites: setBiosysChecked,
    waterQualitySites: setWaterQualityChecked,
    riverLevelSites: setRiverLevelChecked,
    riverFlowSites: setRiverFlowChecked,
    freshwaterSites: setFreshwaterChecked,
    hydroNodes: setHydroNodes,
    watercourseLinks: setWatercourseLinks,
  };

  const toggleLayer = (e) => {
    const layer = e.target.id;
    const checkBoxSetter = layersToSetters[layer];
    const isChecked = e.target.checked;
    const layerVisibility = isChecked ? "visible" : "none";

    checkBoxSetter(isChecked);
    map.current.setLayoutProperty(layer, "visibility", layerVisibility);
  };

  return (
    <Card className="LayerToggles">
      <Card.Body
        className={
          isExpanded ? "LayerToggles-expanded" : "LayerToggles-collapsed"
        }
      >
        <Form>
          <Form.Switch
            label="Hydro Nodes"
            id="hydroNodes"
            onChange={toggleLayer}
            checked={hydroNodesChecked}
          />
          <Form.Switch
            label="Watercourse Links"
            id="watercourseLinks"
            onChange={toggleLayer}
            checked={watercourseLinksChecked}
          />
          <Form.Switch
            label="Biosys Sites"
            id="biosysSites"
            onChange={toggleLayer}
            checked={biosysChecked}
          />
          <Form.Switch
            label="Water Quality Sites"
            id="waterQualitySites"
            onChange={toggleLayer}
            checked={waterQualityChecked}
          />
          <Form.Switch
            label="River Level Sites"
            id="riverLevelSites"
            onChange={toggleLayer}
            checked={riverLevelChecked}
          />
          <Form.Switch
            label="River Flow Sites"
            id="riverFlowSites"
            onChange={toggleLayer}
            checked={riverFlowChecked}
          />
          <Form.Switch
            label="Fish Population Freshwater Sites"
            id="freshwaterSites"
            onChange={toggleLayer}
            checked={freshwaterChecked}
          />
        </Form>
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleExpanded}
          className="LayerToggles-collapse-button"
        >
          {buttonSymbol}
        </Button>
      </Card.Body>
    </Card>
  );
}

export default LayerToggles;
