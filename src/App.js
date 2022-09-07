import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Map from "./components/Map";

function App() {
  return (
    <div>
      <div>
        <Routes>
          <Route
            path="/watercourse-link/:watercourseLinkId"
            element={<Map />}
          />
          <Route path="*" element={<Map />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
