import { useState, useEffect } from "react";
import { fetchProjects } from "../services/projectService";
import { fetchPortfolio } from "../services/portfolioService";

function StudentProfile() {
  const [profile, setProfile] = useState({});
  const [projects, setProjects] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [image, setImage] = useState("");
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const dl = JSON.parse(localStorage.getItem("deadlines")) || [];

    const loadProfile = async () => {
      setProfile(user);
      setDeadlines(dl);

      const projectsResult = await fetchProjects(user.email || "");
      setProjects(projectsResult.data || []);

      const portfolioResult = await fetchPortfolio(user.email || "");
      setPortfolio(portfolioResult.data || null);
    };

    loadProfile();

    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) setImage(savedImage);
  }, []);

  const total = projects.length;
  const reviewedProjects = projects.filter(
    (p) => String(p.status || "").toLowerCase() === "reviewed"
  );
  const reviewedPortfolio =
    portfolio && String(portfolio.status || "").toLowerCase() === "reviewed"
      ? [portfolio]
      : [];
  const completed = reviewedProjects.length + reviewedPortfolio.length;

  const allReviewedMarks = [
    ...reviewedProjects.map((p) => Number(p.marks || 0)),
    ...reviewedPortfolio.map((p) => Number(p.marks || 0))
  ];

  const highest =
    allReviewedMarks.length > 0 ? Math.max(...allReviewedMarks) : 0;

  const avg =
    allReviewedMarks.length > 0
      ? Math.round(allReviewedMarks.reduce((a, b) => a + b, 0) / allReviewedMarks.length)
      : 0;

  const roleLabel = profile?.role === "teacher" ? "Teacher" : "Student";

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      localStorage.setItem("profileImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="content">

      {/* TOP */}
      <div className="top">

        {/* PROFILE */}
        <div className="profile">

          <div className="avatar-wrapper">
            {image ? (
              <img src={image} className="avatar-img" />
            ) : (
              <div className="avatar">
                <span>{profile.name?.charAt(0) || "S"}</span>
              </div>
            )}

            <label className="upload-icon">
              📷
              <input type="file" hidden onChange={handleImageUpload} />
            </label>
          </div>

          <h3>{profile.name}</h3>
          <p>{profile.email}</p>
          <span className="role-chip">{roleLabel}</span>

        </div>

        {/* OVERVIEW */}
        <div className="overview">
          <h2>Student Overview</h2>

          <div className="grid">
            <div className="card"><span>Total Projects</span><b>{total}</b></div>
            <div className="card"><span>Reviewed</span><b>{completed}</b></div>
            <div className="card"><span>Highest Score</span><b>{highest}/100</b></div>
            <div className="card"><span>Average Score</span><b>{avg}/100</b></div>
          </div>
        </div>

      </div>

      {/* PROJECTS */}
      <div className="section">
        <h2>My Projects</h2>

        {projects.length === 0 ? (
          <p>No projects yet</p>
        ) : (
          projects.map((p, i) => (
            <div key={i} className="row-card">

              <div>
                <h4>{p.title}</h4>
                <p>{p.milestone}</p>
              </div>

              <div className="right">
                <span className={`status ${p.status}`}>
                  {p.status || "Pending"}
                </span>
                {p.marks !== null && p.marks !== undefined && p.marks !== "" && (
                  <span className="score">{Number(p.marks)}/100</span>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* REVIEW RESULTS */}
      <div className="section">
        <h2>Review Results</h2>

        {[...reviewedProjects, ...reviewedPortfolio].length === 0 ? (
          <p>No reviewed submissions yet</p>
        ) : (
          [...reviewedProjects, ...reviewedPortfolio].map((p, i) => (
              <div key={i} className="review-result-card">
                <div>
                  <h4>{p.title || "Portfolio Submission"}</h4>
                  <p className="review-status">Reviewed</p>
                </div>
                <span className="review-score-pill">{Number(p.marks || 0)}/100</span>
              </div>
            ))
        )}
      </div>

      {/* PORTFOLIO */}
      <div className="section">
        <h2>My Portfolio Submission</h2>

        {!portfolio ? (
          <p>No portfolio submitted yet</p>
        ) : (
          <div className="feedback-card">
            <h4>{portfolio.title || "Portfolio"}</h4>
            <p>{portfolio.summary || "No summary added"}</p>
            <p><b>Visibility:</b> {portfolio.visibility || "Public"}</p>
            {String(portfolio.status || "").toLowerCase() === "reviewed" ? (
              <p className="portfolio-reviewed-pill">Reviewed Mark: {Number(portfolio.marks || 0)}/100</p>
            ) : null}
          </div>
        )}
      </div>

      {/* DEADLINES */}
      <div className="section">
        <h2>Upcoming Deadlines</h2>

        {deadlines.length === 0 ? (
          <p>No deadlines</p>
        ) : (
          deadlines.slice(0, 3).map((d, i) => (
            <div key={i} className="row-card">

              <div>
                <h4>{d.title}</h4>
                <p>{d.date}</p>
              </div>

              <span className="badge">{d.milestone}</span>

            </div>
          ))
        )}
      </div>

      {/* CSS */}
      <style>{`

        body {
          margin: 0;
          font-family: 'Poppins', sans-serif;
        }

        .content {
          padding: 25px;
          background: #f4f6fb;
          min-height: 100vh;
        }

        .top {
          display: flex;
          gap: 20px;
        }

        .profile {
          width: 260px;
          background: white;
          padding: 25px;
          border-radius: 14px;
          text-align: center;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .overview {
          flex: 1;
          background: white;
          padding: 25px;
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .card {
          background: #f7f8fc;
          padding: 14px;
          border-radius: 10px;
        }

        /* 🔥 SECTIONS */
        .section {
          margin-top: 20px;
          background: white;
          padding: 20px;
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .row-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          margin-top: 10px;
          background: #f7f8fc;
          border-radius: 10px;
        }

        .right {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .status {
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 12px;
        }

        .status.Reviewed {
          background: #dcfce7;
          color: #166534;
        }

        .status.Pending {
          background: #fef3c7;
          color: #92400e;
        }

        .score {
          color: #1e3a8a;
          font-weight: 500;
        }

        .feedback-card {
          margin-top: 10px;
          padding: 14px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .review-result-card {
          margin-top: 10px;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #dbe7ff;
          background: linear-gradient(180deg, #f8fbff 0%, #f1f7ff 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .review-status {
          font-size: 12px;
          color: #334155;
          margin-top: 4px;
        }

        .review-score-pill {
          background: #0f172a;
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
        }

        .portfolio-reviewed-pill {
          margin-top: 10px;
          display: inline-block;
          background: #0f172a;
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .role-chip {
          display: inline-block;
          margin-top: 10px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 999px;
        }

        .badge {
          background: #e0e7ff;
          padding: 5px 12px;
          border-radius: 10px;
          font-size: 12px;
        }

      `}</style>

    </div>
  );
}

export default StudentProfile;