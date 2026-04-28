import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../services/projectService";

function NewProject() {

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tech: "",
    deadline: "",
    milestone: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allMilestones = [
      "Problem Statement",
      "System Design",
      "Frontend Prototype",
      "Backend Development",
      "Final Submission"
    ];

    const selectedIndex = allMilestones.indexOf(formData.milestone);

    const milestones = allMilestones.map((m, index) => {
      if (index < selectedIndex) {
        return { name: m, status: "Completed" };
      } else if (index === selectedIndex) {
        return { name: m, status: "In Progress" };
      } else {
        return { name: m, status: "Pending" };
      }
    });

    const newProject = {
      id: Date.now(),
      ...formData,
      milestones,
      ownerEmail: (currentUser?.email || "").trim().toLowerCase(),
      ownerName: currentUser?.name || "Student"
    };

    const result = await createProject(newProject, currentUser?.email || "");

    if (!result.ok) {
      alert(result.message || "Unable to save project.");
      return;
    }

    if (result.source === "local" && result.message) {
      alert(result.message);
    }

    navigate("/projects", { state: result.data });
  };

  return (
    <div className="new-project-page">

      <h1>Create New Project</h1>

      <form className="project-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Project Title</label>
          <input
            name="title"
            placeholder="Ex: AI Portfolio Tracker"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            placeholder="Describe your project goal..."
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Technologies</label>
          <input
            name="tech"
            placeholder="React, Node, MongoDB"
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Deadline</label>
          <input
            type="date"
            name="deadline"
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Milestone</label>
          <select
            name="milestone"
            onChange={handleChange}
            required
          >
            <option value="">Select milestone</option>
            <option>Problem Statement</option>
            <option>System Design</option>
            <option>Frontend Prototype</option>
            <option>Backend Development</option>
            <option>Final Submission</option>
          </select>
        </div>

        <button className="submit-btn">
          Submit Project
        </button>

      </form>
    </div>
  );
}

export default NewProject;