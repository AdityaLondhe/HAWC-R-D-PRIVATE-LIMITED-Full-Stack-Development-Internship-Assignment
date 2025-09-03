import { useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // your backend
});

// attach token dynamically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [page, setPage] = useState(localStorage.getItem("token") ? "teachers" : "login");
  const [form, setForm] = useState({}); // for login/register
  const [teachers, setTeachers] = useState([]);

  // handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // register user + teacher
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/register", form);
      alert("Registered successfully! Please login.");
      setPage("login");
      setForm({});
    } catch (err) {
      alert("Registration failed: " + err.response?.data?.error);
    }
  };

  // login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
      setPage("teachers");
    } catch (err) {
      alert("Login failed: " + err.response?.data?.error);
    }
  };

  // fetch teachers
  const fetchTeachers = async () => {
    try {
      const res = await api.get("/teachers");
      setTeachers(res.data);
    } catch (err) {
      alert("Unauthorized: Please login again.");
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setPage("login");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      {!isLoggedIn && page === "login" && (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email || ""}
            onChange={handleChange}
            required
          /><br />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password || ""}
            onChange={handleChange}
            required
          /><br />
          <button type="submit">Login</button>
          <p>
            Don’t have an account?{" "}
            <button type="button" onClick={() => setPage("register")}>
              Register
            </button>
          </p>
        </form>
      )}

      {!isLoggedIn && page === "register" && (
        <form onSubmit={handleRegister}>
          <h2>Register</h2>
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={form.first_name || ""}
            onChange={handleChange}
            required
          /><br />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={form.last_name || ""}
            onChange={handleChange}
            required
          /><br />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email || ""}
            onChange={handleChange}
            required
          /><br />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password || ""}
            onChange={handleChange}
            required
          /><br />
          <input
            type="text"
            name="university_name"
            placeholder="University Name"
            value={form.university_name || ""}
            onChange={handleChange}
            required
          /><br />
          <input
            type="text"
            name="gender"
            placeholder="Gender"
            value={form.gender || ""}
            onChange={handleChange}
            required
          /><br />
          <input
            type="number"
            name="year_joined"
            placeholder="Year Joined"
            value={form.year_joined || ""}
            onChange={handleChange}
            required
          /><br />
          <button type="submit">Register</button>
          <p>
            Already have an account?{" "}
            <button type="button" onClick={() => setPage("login")}>
              Login
            </button>
          </p>
        </form>
      )}

      {isLoggedIn && page === "teachers" && (
        <div>
          <h2>Teachers</h2>
          <button onClick={fetchTeachers}>Load Teachers</button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              setIsLoggedIn(false);
              setPage("login");
            }}
            style={{ marginLeft: "10px" }}
          >
            Logout
          </button>

          <table border="1" cellPadding="5" style={{ marginTop: "20px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>University</th>
                <th>Gender</th>
                <th>Year Joined</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.email}</td>
                  <td>{t.first_name} {t.last_name}</td>
                  <td>{t.university_name}</td>
                  <td>{t.gender}</td>
                  <td>{t.year_joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
