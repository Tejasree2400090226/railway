import { useEffect, useState } from "react";
import { createDeadline, fetchDeadlines } from "../../services/deadlineService";
import "./TeacherDeadlines.css";

function TeacherDeadlines() {

  const [form, setForm] = useState({
    title: "",
    date: "",
    milestone: ""
  });

  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    const loadDeadlines = async () => {
      const result = await fetchDeadlines();
      setDeadlines(result.data || []);
    };

    loadDeadlines();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleAdd = async () => {

    if (!form.title || !form.date || !form.milestone) {
      alert("Fill all fields");
      return;
    }

    const result = await createDeadline(form);

    if (!result.ok) {
      alert(result.message || "Unable to add deadline");
      return;
    }

    setDeadlines((prev) => [result.data, ...prev]);

    if (result.source === "local" && result.message) {
      alert(result.message);
    }

    setForm({ title: "", date: "", milestone: "" });
  };

  return (
    <div className="teacher-page">

      <h1 className="page-title">Manage Deadlines</h1>

      {/* FORM */}
      <div className="deadline-form">

        <input
          name="title"
          placeholder="Deadline title"
          value={form.title}
          onChange={handleChange}
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />

        {/* 🔥 MILESTONE SELECT */}
        <select
          name="milestone"
          value={form.milestone}
          onChange={handleChange}
        >
          <option value="">Select milestone</option>
          <option>Problem Statement</option>
          <option>System Design</option>
          <option>Frontend Prototype</option>
          <option>Backend Development</option>
          <option>Final Submission</option>
        </select>

        <button onClick={handleAdd}>
          + Add
        </button>

      </div>

      {/* LIST */}
      <div className="deadline-list">

        {deadlines.length === 0 ? (
          <p>No deadlines added</p>
        ) : (
          deadlines.map(item => (
            <div key={item.id} className="deadline-card">

              <div>
                <h3>{item.title}</h3>
                <p>{item.date}</p>
              </div>

              {/* 🔥 SHOW MILESTONE */}
              <span className="milestone-badge">
                {item.milestone}
              </span>

            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default TeacherDeadlines;