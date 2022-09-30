import React, { useContext } from "react";
import Button from "react-bootstrap/Button";
import "./NoWatercourseLinkButton.css";
import { MapContext } from "./Map.js";

function NoWatercourseLinkButton({ map }) {
  const mapState = useContext(MapContext);

  return (
    mapState && (
      <Button className="NoWatercourseLinkButton" variant="warning">
        No Watercourse Link
      </Button>
    )
  );
}

export default NoWatercourseLinkButton;
