import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax

import Search from "./Search";
import SearchHereButton from "./SearchHereButton";
import LayerToggles from "./LayerToggles";

import "./Map.css";

import { setupEmptyOverlays } from "../utils/map";
import { setupLayerPopups } from "../utils/popups";
import { useParams } from "react-router-dom";
import { showWatercourseLink } from "../utils/wc-link-from-id";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-2.25);
  const [lat, setLat] = useState(53.48);
  const [zoom, setZoom] = useState(9);
  const [showSearch, setShowSearch] = useState(true);

  const OSapiKey = process.env.REACT_APP_OS_API_KEY;
  const OSserviceUrl = "https://api.os.uk/maps/raster/v1/zxy";

  const watercourseLinkId = useParams().watercourseLinkId;

  const setLngLat = ([lng, lat]) => {
    setLng(lng.toFixed(4));
    setLat(lat.toFixed(4));
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "raster-tiles": {
            type: "raster",
            tiles: [
              OSserviceUrl + "/Light_3857/{z}/{x}/{y}.png?key=" + OSapiKey,
            ],
            tileSize: 256,
            maxzoom: 17,
          },
        },
        layers: [
          {
            id: "os-maps-zxy",
            type: "raster",
            source: "raster-tiles",
          },
        ],
        sprite: "mapbox://sprites/mapbox/bright-v9",
      },
      maxBounds: [
        [-6.354204, 49.894995],
        [2.066974, 55.765636],
      ],
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("load", () => {
      map.current.dragRotate.disable();
      map.current.touchZoomRotate.disableRotation();
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false,
        })
      );

      setupEmptyOverlays(map.current);
      setupLayerPopups(map.current);
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize

    map.current.on("move", () => {
      setLngLat([map.current.getCenter().lng, map.current.getCenter().lat]);
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize

    map.current.once("idle", () => {
      if (watercourseLinkId) {
        showWatercourseLink(watercourseLinkId, map);
        setShowSearch(false);
      }
    });
  }, [watercourseLinkId]);

  return (
    <>
      <Search map={map} initialShow={showSearch} />
      <SearchHereButton map={map} />
      <LayerToggles map={map} />
      <div ref={mapContainer} className="Map-container" />
    </>
  );
}

export default Map;
