

import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

function App() {
  return (
    <div className="App" >
      
      <div className="row">
      <div  className="col-4">
        <Navbar />
      </div>

      <div  className="col-8">
        <Outlet /> 
      </div>
    </div>
  </div>
  );
}

export default App;