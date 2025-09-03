import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get("/teachers");
        setTeachers(res.data);
      } catch (err) {
        alert("Failed to load teachers: " + err.response?.data?.error);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Teachers (teachers table)</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>University</th>
            <th>Gender</th>
            <th>Year Joined</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.user_id}</td>
              <td>{t.university_name}</td>
              <td>{t.gender}</td>
              <td>{t.year_joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
