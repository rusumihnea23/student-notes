import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <h1>Home Page</h1>
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;