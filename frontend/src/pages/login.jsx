import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login/students", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      navigate("/"); 
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleRedirect = () => {
    navigate("/register");
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div class="form-group">
    <label for="exampleInputEmail1"> Email address </label>
     <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
  </div>
  <div class="form-group">
    <label for="exampleInputPassword1"> Password </label>
    <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
  <button type="submit" class="btn btn-primary">Login </button>
  <p>
        Don’t have an account?{" "}
        <button type="button" onClick={handleRedirect}>
          Register
        </button>
      </p>
  </div>
  

      <h2>Login</h2>


      
    </form>
    
    

  );
}

export default Login;