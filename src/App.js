import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import logo from './logo.svg';
import './App.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2lyYXN3aXJybCIsImEiOiJja3ozbGU4bmswN3VyMnZueGJzNzVvamd1In0.8fWEPYXz_fcsr8YCc9w1Kg';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-2.25);
  const [lat, setLat] = useState(53.48);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      maxBounds: [
        [-6.354204, 49.894995],
        [2.066974, 55.765636]
      ],
      center: [lng, lat],
      zoom: zoom
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  return (
    <div>
      <div className="sidebar">
      Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
    </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
