import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

import Search from "./Search"
import './Map.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-2.25);
  const [lat, setLat] = useState(53.48);
  const [zoom, setZoom] = useState(9);

  const OSapiKey = process.env.REACT_APP_OS_API_KEY;
  const OSserviceUrl = 'https://api.os.uk/maps/raster/v1/zxy';

  const setLngLat = ([lng, lat]) => {
    setLng(lng.toFixed(4));
    setLat(lat.toFixed(4));
  }

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      // style: OSserviceUrl + '/resources/styles?key=' + OSapiKey,
      // style: 'mapbox://styles/mapbox/streets-v11',
      style: {
        "version": 8,
        "sources": {
          "raster-tiles": {
            "type": "raster",
            "tiles": [ OSserviceUrl + "/Light_3857/{z}/{x}/{y}.png?key=" + OSapiKey ],
            "tileSize": 256,
            // "maxzoom": 20
          }
        },
        "layers": [{
          "id": "os-maps-zxy",
          "type": "raster",
          "source": "raster-tiles",
        }],
        "sprite": "mapbox://sprites/mapbox/bright-v9",
      },
      maxBounds: [
        [-6.354204, 49.894995],
        [2.066974, 55.765636]
      ],
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.dragRotate.disable() // Disable map rotation using right click + drag. map.current.touchZoomRotate.disableRotation(); // Disable map rotation using touch rotation gesture.
    // Add navigation control (excluding compass button) to the map.
    map.current.addControl(new mapboxgl.NavigationControl({
      showCompass: false
    }));

    (async () => {
      const airports = await fetch('https://demo.ldproxy.net/zoomstack/collections/airports/items?limit=100', {
        headers: {
          'Accept': 'application/geo+json'
        }
      }).then(response => response.json());

      map.current.addSource('airports', {
        type: 'geojson',
        data: airports
      });

      map.current.addLayer({
        'id': 'airports',
        'type': 'symbol',
        'source': 'airports',
        "layout": {
          "icon-image": "airport-15"
        }
      });
    })();
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLngLat([map.current.getCenter().lng, map.current.getCenter().lat])
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  return (
    <>
      <Search map={map} />
      <div ref={mapContainer} className="Map-container" />
    </>
  );
}

export default Map;
