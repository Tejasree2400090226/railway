import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPortfolio } from "../services/portfolioService";

function Portfolio() {
  const [portfolios, setPortfolios] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const loadPortfolio = async () => {
      const result = await fetchPortfolio(user?.email || "");
      const list = Array.isArray(result.items)
        ? result.items
        : (result.data ? [result.data] : []);
      setPortfolios(list);
    };

    loadPortfolio();
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>My Portfolio</h1>
          <p>Manage and submit your academic portfolio</p>
        </div>

        <Link to="/portfolio/new" className="new-portfolio-btn">
          + Create Portfolio
        </Link>
      </div>

      <div className="content-area">

        {portfolios.length === 0 ? (
          <div className="portfolio-empty-card">
            <h3>No Portfolio Created Yet</h3>
            <p>
              Create your portfolio to showcase your projects,
              skills, certifications, and achievements.
            </p>
          </div>
        ) : (
          <div className="portfolio-list">
            {portfolios.map((portfolio, cardIndex) => {
            const safeSkills = typeof portfolio?.skills === "string" ? portfolio.skills : "";
            const safeLinks = Array.isArray(portfolio?.links) ? portfolio.links : [];

            return (
              <div
                key={portfolio.id || portfolio.localId || cardIndex}
                className="portfolio-card-modern"
                style={{ marginBottom: "20px" }}
              >
                <h2 className="portfolio-title">{portfolio.title}</h2>

                <div className="portfolio-section">
                  <h4>Summary</h4>
                  <p>{portfolio.summary}</p>
                </div>

                <div className="portfolio-section">
                  <h4>Skills</h4>
                  <div className="skills-row">
                    {safeSkills
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean)
                      .map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="portfolio-section">
                  <h4>LinkedIn</h4>
                  <a
                    href={portfolio.linkedin || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portfolio-link"
                  >
                    {portfolio.linkedin || "Not provided"}
                  </a>
                </div>

                <div className="portfolio-section">
                  <h4>Visibility</h4>
                  <span className="visibility-badge">
                    {portfolio.visibility}
                  </span>
                </div>

                <div className="portfolio-section">
                  <h4>Project Links</h4>

                  {safeLinks.length === 0 ? (
                    <p>No links added.</p>
                  ) : (
                    safeLinks.map((link, index) => (
                    <div key={index} className="link-card">
                      <a
                        href={link.github || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🔗 GitHub
                      </a>

                      <a
                        href={link.live || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🌍 Live Demo
                      </a>
                    </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}

      </div>
    </>
  );
}

export default Portfolio;