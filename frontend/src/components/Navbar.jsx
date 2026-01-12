import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logout from "../pages/Logout.jsx";
import api from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res = await api.get("/username");

        // Axios puts response data here
        setUsername(res.data.username);
      } catch (err) {
        console.error("Error fetching username:", err);
      }
    };

    fetchUsername();
  }, []);

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
        <h5 className="mb-4 text-info">{username}</h5>
        <ul className="nav nav-pills flex-column gap-2">
          <li className="nav-item">
            <div
              className="nav-link text-white"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/mynotes")}
            >
              My Notes
            </div>
            <div
              className="nav-link text-white"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/students/note")}
            >
              Add Note
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
