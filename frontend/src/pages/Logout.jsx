import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out"); // DEBUG
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
      window.location.href = "/login";
  };

  return (
    <button
      className="nav-link text-danger bg-transparent border-0 text-start"
      style={{ cursor: "pointer" }}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default Logout;
