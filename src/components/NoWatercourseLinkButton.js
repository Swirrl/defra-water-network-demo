import React, { useContext } from "react";
import Button from "react-bootstrap/Button";
import "./NoWatercourseLinkButton.css";
import { MapContext } from "./Map";
import { saveWatercourseLinkSiteAssociation } from "../utils/water-network-data";
import { setWCLinkSelectMode, setWCLinkHoverMode } from "../utils/popups";
import { unhighlightWatercourseLink } from "../utils/map";

const NO_WC_LINK = "NO_WC_LINK_OVERRIDE";

function NoWatercourseLinkButton({ map, setMapContext }) {
  const selectModeCurrentSite = useContext(MapContext);

  const selectNoWatercourseLink = async () => {
    await saveWatercourseLinkSiteAssociation(
      NO_WC_LINK,
      selectModeCurrentSite
    ).finally(() => {
      unhighlightWatercourseLink(map.current);

      setWCLinkSelectMode(false, setMapContext);
      setWCLinkHoverMode(map.current, null, false);
    });
  };

  return (
    selectModeCurrentSite && (
      <Button
        className="NoWatercourseLinkButton govuk-button"
        variant="warning"
        onClick={selectNoWatercourseLink}
      >
        No Watercourse Link
      </Button>
    )
  );
}

export default NoWatercourseLinkButton;
