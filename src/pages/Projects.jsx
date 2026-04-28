import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProjects } from "../services/projectService";

function Projects() {

  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      const result = await fetchProjects(currentUser?.email || "");
      if (result.ok) {
        setProjects(result.data);
      }
    };

    loadProjects();
  }, [currentUser?.email]);

  useEffect(() => {
    if (!location.state) {
      return;
    }

    setProjects((prev) => {
      const exists = prev.some((project) => project.id === location.state.id);
      if (exists) {
        return prev;
      }
      return [location.state, ...prev];
    });
  }, [location.state]);

  const calculateProgress = (milestones) => {
    const completed = milestones.filter(m => m.status === "Completed").length;
    const inProgress = milestones.filter(m => m.status === "In Progress").length;

    return Math.round(
      ((completed + inProgress * 0.5) / milestones.length) * 100
    );
  };

  return (
    <div className="projects-page">

      <div className="projects-header">
        <div>
          <h1>My Projects</h1>
          <p className="subtitle">
            Manage your project milestones & submissions
          </p>
        </div>

        <button
          className="new-project-btn"
          onClick={() => navigate("/projects/new")}
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="portfolio-empty-card">
          <h3>No Projects Created Yet</h3>
        </div>
      ) : (
        <div className="projects-left">

          {projects.map((project, index) => {

            const progress = calculateProgress(project.milestones);

            return (
              <div key={index} className="project-card-modern">

                <div className="project-top">
                  <h3>{project.title}</h3>
                  <span className={`status ${progress === 100 ? "completed" : "active"}`}>
                    {progress === 100 ? "Completed" : "In Progress"}
                  </span>
                </div>

                <p className="project-desc">{project.description}</p>

                <div className="tags">
                  {project.tech?.split(",").map((t, i) => (
                    <span key={i}>{t.trim()}</span>
                  ))}
                </div>

                <div className="milestone-list">
                  {project.milestones.map((m, i) => {

                    let color = "#6b7280";
                    let bg = "#f3f4f6";

                    if (m.status === "Completed") {
                      color = "#16a34a";
                      bg = "#dcfce7";
                    } else if (m.status === "In Progress") {
                      color = "#2563eb";
                      bg = "#dbeafe";
                    }

                    return (
                      <span
                        key={i}
                        style={{
                          marginRight: "8px",
                          marginBottom: "6px",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          background: bg,
                          color: color,
                          fontSize: "12px",
                          display: "inline-block"
                        }}
                      >
                        {m.status === "Completed" && "✔ "}
                        {m.status === "In Progress" && "⏳ "}
                        {m.status === "Pending" && "• "}
                        {m.name}
                      </span>
                    );
                  })}
                </div>

                <div className="progress-wrapper">
                  <div className="progress-bar-modern">
                    <div
                      className="progress-fill-modern"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <span className="progress-text">
                    {progress}% In Progress
                  </span>
                </div>

                <div className="project-footer">
                  <span>{project.milestones.length} Milestones</span>
                  <span>Due {project.deadline}</span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default Projects;