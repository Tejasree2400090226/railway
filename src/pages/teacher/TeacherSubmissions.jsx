import { useEffect, useState } from "react";
import { fetchAllProjects, reviewProject } from "../../services/projectService";
import { fetchAllPortfolios, reviewPortfolio } from "../../services/portfolioService";
import "./TeacherSubmissions.css";

function TeacherSubmissions() {

  const [projects, setProjects] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [projectReviews, setProjectReviews] = useState({});
  const [portfolioReviews, setPortfolioReviews] = useState({});

  useEffect(() => {
    const loadSubmissions = async () => {
      const result = await fetchAllProjects();
      const allProjects = (result.data || []).map((project) => ({
        ...project,
        student:
          project.ownerName ||
          project.student ||
          (project.ownerEmail ? project.ownerEmail.split("@")[0] : "Student"),
        email: project.ownerEmail || project.email || ""
      }));

      setProjects(allProjects);

      const portfolioResult = await fetchAllPortfolios();
      const allPortfolios = (portfolioResult.data || []).map((portfolio) => ({
        ...portfolio,
        student:
          portfolio.ownerName ||
          (portfolio.ownerEmail ? portfolio.ownerEmail.split("@")[0] : "Student")
      }));
      setPortfolios(allPortfolios);
    };

    loadSubmissions();
  }, []);

  const handleReview = async (projectId, marks, feedback) => {
    if (!marks || !feedback) {
      alert("Enter marks and feedback before submitting.");
      return;
    }

    const result = await reviewProject({ projectId, marks, feedback });

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              marks: Number(marks),
              feedback,
              status: "Reviewed"
            }
          : project
      )
    );

    if (result.source === "local" && result.message) {
      alert(result.message);
      return;
    }

    alert("Review submitted ✅");
  };

  const handlePortfolioReview = async (portfolioId, marks, feedback) => {
    if (!marks || !feedback) {
      alert("Enter marks and feedback before submitting.");
      return;
    }

    const result = await reviewPortfolio({ portfolioId, marks, feedback });

    setPortfolios((prev) =>
      prev.map((portfolio) =>
        portfolio.id === portfolioId || portfolio.localId === portfolioId
          ? {
              ...portfolio,
              marks: Number(marks),
              feedback,
              status: "Reviewed"
            }
          : portfolio
      )
    );

    if (result.source === "local" && result.message) {
      alert(result.message);
      return;
    }

    alert("Portfolio review submitted ✅");
  };

  return (
    <div className="teacher-page">

      <h1>Project Submissions</h1>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h3>No Submissions Yet</h3>
          <p>Students haven't submitted any projects.</p>
        </div>
      ) : (
        <div className="submission-grid">

          {projects.map(project => {
            const reviewState = projectReviews[project.id] || {
              marks: project.marks || "",
              feedback: project.feedback || ""
            };
            const isReviewed = String(project.status || "").toLowerCase() === "reviewed";

            return (
              <div key={project.id} className="submission-card">

                <div className="card-header">
                  <div>
                    <h3>{project.title}</h3>
                    <p>👤 {project.student}</p>
                    <p>📌 {project.milestone}</p>
                  </div>

                  <span className={`status ${project.status}`}>
                    {project.status}
                  </span>
                </div>

                <a
                  href={project.github || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="github"
                >
                  🔗 View Project
                </a>

                {isReviewed ? (
                  <div className="review-summary">
                    <span className="review-mark">{Number(project.marks || 0)}/100</span>
                    <p>{project.feedback || "No feedback provided."}</p>
                  </div>
                ) : (
                  <div className="review-box">

                    <input
                      type="number"
                      placeholder="Marks"
                      value={reviewState.marks}
                      onChange={(e) =>
                        setProjectReviews((prev) => ({
                          ...prev,
                          [project.id]: {
                            ...reviewState,
                            marks: e.target.value
                          }
                        }))
                      }
                    />

                    <textarea
                      placeholder="Write feedback..."
                      value={reviewState.feedback}
                      onChange={(e) =>
                        setProjectReviews((prev) => ({
                          ...prev,
                          [project.id]: {
                            ...reviewState,
                            feedback: e.target.value
                          }
                        }))
                      }
                    />

                    <button
                      onClick={() =>
                        handleReview(project.id, reviewState.marks, reviewState.feedback)
                      }
                    >
                      Submit Review
                    </button>

                  </div>
                )}

              </div>
            );
          })}

        </div>
      )}

      <h1 style={{ marginTop: "30px" }}>Portfolio Submissions</h1>

      {portfolios.length === 0 ? (
        <div className="empty-state">
          <h3>No Portfolio Submissions Yet</h3>
          <p>Students have not submitted portfolios.</p>
        </div>
      ) : (
        <div className="submission-grid">
          {portfolios.map((portfolio, index) => (
            <div key={portfolio.id || portfolio.localId || `${portfolio.ownerEmail || "unknown"}-${index}`} className="submission-card">
              {(() => {
                const reviewKey = portfolio.id || portfolio.localId || `${portfolio.ownerEmail || "unknown"}-${index}`;
                const reviewState = portfolioReviews[reviewKey] || {
                  marks: portfolio.marks || "",
                  feedback: portfolio.feedback || ""
                };
                const isReviewed = String(portfolio.status || "").toLowerCase() === "reviewed";

                const links = Array.isArray(portfolio.links) ? portfolio.links : [];

                return (
                  <>
              <div className="card-header">
                <div>
                  <h3>{portfolio.title || "Portfolio"}</h3>
                  <p>👤 {portfolio.student}</p>
                  <p>📌 {portfolio.visibility || "Public"}</p>
                </div>
                <span className={`status ${portfolio.status || "Reviewed"}`}>
                  {portfolio.status || "Submitted"}
                </span>
              </div>

              <p>{portfolio.summary || "No summary provided"}</p>

              <div className="portfolio-links" style={{ margin: "10px 0" }}>
                {links.length === 0 ? (
                  <p>No GitHub/Live links added.</p>
                ) : (
                  links.map((link, index) => (
                    <div key={index} className="link-card" style={{ marginBottom: "8px" }}>
                      {link.github ? (
                        <a href={link.github} target="_blank" rel="noreferrer" className="github">
                          🔗 GitHub Link {index + 1}
                        </a>
                      ) : null}
                      {link.live ? (
                        <a href={link.live} target="_blank" rel="noreferrer" className="github" style={{ marginLeft: "10px" }}>
                          🌍 Live Link {index + 1}
                        </a>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              {isReviewed ? (
                <div className="review-summary">
                  <span className="review-mark">{Number(portfolio.marks || 0)}/100</span>
                  <p>{portfolio.feedback || "No feedback provided."}</p>
                </div>
              ) : (
                <div className="review-box">
                  <input
                    type="number"
                    placeholder="Marks"
                    value={reviewState.marks}
                    onChange={(e) =>
                      setPortfolioReviews((prev) => ({
                        ...prev,
                        [reviewKey]: {
                          ...reviewState,
                          marks: e.target.value
                        }
                      }))
                    }
                  />

                  <textarea
                    placeholder="Write feedback..."
                    value={reviewState.feedback}
                    onChange={(e) =>
                      setPortfolioReviews((prev) => ({
                        ...prev,
                        [reviewKey]: {
                          ...reviewState,
                          feedback: e.target.value
                        }
                      }))
                    }
                  />

                  <button
                    onClick={() =>
                      handlePortfolioReview(
                        reviewKey,
                        reviewState.marks,
                        reviewState.feedback
                      )
                    }
                  >
                    Submit Portfolio Review
                  </button>
                </div>
              )}
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default TeacherSubmissions;