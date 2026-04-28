import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { savePortfolio } from "../services/portfolioService";

function NewPortfolio() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    skills: "",
    linkedin: "",
    visibility: "Public",
  });

  const [links, setLinks] = useState([{ github: "", live: "" }]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    setLinks(updatedLinks);
  };

  const addLink = () => {
    setLinks([...links, { github: "", live: "" }]);
  };

  const handleSubmit = async () => {

    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!formData.title || !formData.summary || !formData.skills) {
      alert("Please fill all required fields.");
      return;
    }

    const portfolioData = {
      ...formData,
      links: links
    };

    const result = await savePortfolio(portfolioData, user?.email || "");

    if (result.source === "local" && result.message) {
      alert(result.message);
    } else {
      alert("Portfolio saved successfully!");
    }

    navigate("/portfolio");
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Create Portfolio</h1>
          <p>Showcase your skills, projects, and achievements</p>
        </div>
      </div>

      <div className="content-area">
        <div className="form-card">

          {/* TITLE */}
          <div className="form-group">
            <label>Portfolio Title *</label>
            <input
              type="text"
              name="title"
              placeholder="Example: Full Stack Developer Portfolio"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* SUMMARY */}
          <div className="form-group">
            <label>Professional Summary *</label>
            <textarea
              name="summary"
              rows="4"
              placeholder="Write a short introduction about yourself, your skills, and career goals..."
              value={formData.summary}
              onChange={handleChange}
            />
          </div>

          {/* SKILLS */}
          <div className="form-group">
            <label>Skills *</label>
            <input
              type="text"
              name="skills"
              placeholder="Example: React, Node.js, MongoDB, AI, UI/UX"
              value={formData.skills}
              onChange={handleChange}
            />
          </div>

          <h3 className="section-title-form">Project Links</h3>

          {links.map((link, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <label>GitHub URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/yourusername/project-name"
                  value={link.github}
                  onChange={(e) =>
                    handleLinkChange(index, "github", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Live URL</label>
                <input
                  type="url"
                  placeholder="https://yourprojectlive.com"
                  value={link.live}
                  onChange={(e) =>
                    handleLinkChange(index, "live", e.target.value)
                  }
                />
              </div>
            </div>
          ))}

          <button type="button" className="add-btn" onClick={addLink}>
            + Add Another Link
          </button>

          {/* LINKEDIN */}
          <div className="form-group">
            <label>LinkedIn Profile</label>
            <input
              type="url"
              name="linkedin"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedin}
              onChange={handleChange}
            />
          </div>

          {/* VISIBILITY */}
          <div className="form-group">
            <label>Portfolio Visibility</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option>Public</option>
              <option>Private</option>
              <option>Only Teachers</option>
            </select>
          </div>

          <button className="submit-btn" onClick={handleSubmit}>
            Submit Portfolio
          </button>

        </div>
      </div>
    </>
  );
}

export default NewPortfolio;