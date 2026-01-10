import { useNavigate } from "react-router-dom";
import Logout from "../pages/Logout.jsx"; 

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-dark text-white"
      style={{
        width: "220px",        
        minHeight: "100vh",    
        position: "sticky",    
        top: 0,
      }}
    >
      <div className="p-3">
        <h5 className="mb-4">Menu</h5>
        <ul className="nav nav-pills flex-column gap-2">
          <li className="nav-item">
            <div
              className="nav-link text-white"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/mynotes")}
            >
              My Notes
            </div>
          </li>
          <li className="nav-item">
            <div
              className="nav-link text-white"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/shared")}
            >
              Shared Notes
            </div>
          </li>

         <li className="nav-item mt-4">
            <Logout />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
