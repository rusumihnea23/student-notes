import { useState } from "react";
import api from "../services/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    studyYear: 1,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleRegister = async (e) => {
  e.preventDefault();
  try {
    await api.post("/api/auth/register/students", {
      ...form,
      studyYear: Number(form.studyYear),
    });
    alert("Account created! You can now login.");
  } catch (err) {
    alert(err.response?.data?.message || "Register failed");
  }
};


  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="username" placeholder="Username" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <input
        name="studyYear"
        type="number"
        min="1"
        max="5"
        onChange={handleChange}
      />

      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
