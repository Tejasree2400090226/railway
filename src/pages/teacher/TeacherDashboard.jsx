import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllProjects } from "../../services/projectService";
import "./TeacherDashboard.css";

function TeacherDashboard() {

  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [recentProjects, setRecentProjects] = useState([]);
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    const allDeadlines =
      JSON.parse(localStorage.getItem("deadlines")) || [];

    const loadDashboard = async () => {
      const projectsResult = await fetchAllProjects();
      const projects = projectsResult.data || [];

      const reviewed = projects.filter((project) => project.status === "Reviewed").length;
      const pending = projects.length - reviewed;
      const uniqueStudents = new Set(
        projects
          .map((project) => (project.ownerEmail || "").trim().toLowerCase())
          .filter(Boolean)
      );

      const preparedProjects = projects.map((project) => ({
        ...project,
        student:
          project.ownerName ||
          project.student ||
          (project.ownerEmail ? project.ownerEmail.split("@")[0] : "Student")
      }));

      setStats({
        students: uniqueStudents.size,
        projects: preparedProjects.length,
        pending,
        reviewed,
        deadlines: allDeadlines.length
      });

      setRecentProjects(preparedProjects.slice(0, 3));
      setDeadlines(allDeadlines.slice(0, 3));
    };

    loadDashboard();
  }, []);

  return (
    <div className="teacher-dashboard">

      <h1 className="dashboard-title">Teacher Overview</h1>

      {/* STATS */}
      <div className="stats-grid">

        <div className="stat-card">
          <p>Total Students</p>
          <h2>{stats.students || 0}</h2>
        </div>

        <div className="stat-card">
          <p>Total Projects</p>
          <h2>{stats.projects || 0}</h2>
        </div>

        <div className="stat-card warning">
          <p>Pending Reviews</p>
          <h2>{stats.pending || 0}</h2>
        </div>

        <div className="stat-card success">
          <p>Reviewed</p>
          <h2>{stats.reviewed || 0}</h2>
        </div>

        <div className="stat-card">
          <p>Deadlines</p>
          <h2>{stats.deadlines || 0}</h2>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <button onClick={() => navigate("/teacher/submissions")}>
          Review Projects
        </button>
        <button onClick={() => navigate("/teacher/deadlines")}>
          Add Deadline
        </button>
      </div>

      {/* LOWER GRID */}
      <div className="dashboard-bottom">

        {/* RECENT PROJECTS */}
        <div className="panel">
          <h3>Recent Submissions</h3>

          {recentProjects.length === 0 ? (
            <p>No submissions yet</p>
          ) : (
            recentProjects.map(p => (
              <div key={p.id} className="list-item">
                <div>
                  <p className="title">{p.title}</p>
                  <span>{p.student}</span>
                </div>
                <span className={`status ${p.status || "Pending"}`}>
                  {p.status || "Pending"}
                </span>
              </div>
            ))
          )}

        </div>

        {/* DEADLINES */}
        <div className="panel">
          <h3>Upcoming Deadlines</h3>

          {deadlines.length === 0 ? (
            <p>No deadlines</p>
          ) : (
            deadlines.map(d => (
              <div key={d.id} className="list-item">
                <div>
                  <p className="title">{d.title}</p>
                  <span>{d.date}</span>
                </div>
                <span className="badge">
                  {d.milestone}
                </span>
              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
}

export default TeacherDashboard;