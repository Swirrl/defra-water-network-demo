import React, { useRef, useEffect, useState } from 'react';

import logo from './logo.svg';
import './App.css';

import Map from "./components/Map"
import Search from "./components/Search"

function App() {
  return (
    <div>
      <Search />
      <Map />
      <footer>
      </footer>
    </div>
  );
}

export default App;
