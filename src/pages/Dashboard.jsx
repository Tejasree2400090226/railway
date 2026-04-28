import { useEffect, useState } from "react";
import { fetchProjects } from "../services/projectService";
import { fetchPortfolio } from "../services/portfolioService";

function Dashboard() {

  const [stats, setStats] = useState({
    averageScore: 0,
    reviewedCount: 0,
    projectCount: 0,
    deadlineCount: 0
  });
  const [reviewedMarks, setReviewedMarks] = useState([]);
  const [deadlines, setDeadlines] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userEmail = (user?.email || "").trim().toLowerCase();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const localDeadlines = JSON.parse(localStorage.getItem("deadlines") || "[]");
        setDeadlines(localDeadlines);

        if (!userEmail) {
          setStats({
            averageScore: 0,
            reviewedCount: 0,
            projectCount: 0,
            deadlineCount: localDeadlines.length
          });
          setReviewedMarks([]);
          return;
        }

        const [projectsResult, portfolioResult] = await Promise.all([
          fetchProjects(userEmail),
          fetchPortfolio(userEmail)
        ]);

        const projectList = Array.isArray(projectsResult.data) ? projectsResult.data : [];
        const portfolioList = Array.isArray(portfolioResult.items)
          ? portfolioResult.items
          : (portfolioResult.data ? [portfolioResult.data] : []);

        const parseMarks = (value) => {
          if (value === null || value === undefined || value === "") {
            return null;
          }
          const raw = String(value);
          const numericChunk = raw.includes("/") ? raw.split("/")[0] : raw;
          const parsed = Number(numericChunk);
          return Number.isFinite(parsed) ? parsed : null;
        };

        const isReviewed = (status) => String(status || "").toLowerCase() === "reviewed";

        const projectReviews = projectList
          .filter((item) => isReviewed(item.status) && parseMarks(item.marks) !== null)
          .map((item) => ({
            id: item.id || item.localId || `project-${item.title}`,
            type: "Project",
            title: item.title || "Untitled Project",
            marks: parseMarks(item.marks)
          }));

        const portfolioReviews = portfolioList
          .filter((item) => isReviewed(item.status) && parseMarks(item.marks) !== null)
          .map((item, index) => ({
            id: item.id || item.localId || `portfolio-${index}`,
            type: "Portfolio",
            title: item.title || "Portfolio Submission",
            marks: parseMarks(item.marks)
          }));

        const reviewed = [...projectReviews, ...portfolioReviews];
        const averageScore = reviewed.length
          ? Math.round(reviewed.reduce((sum, item) => sum + item.marks, 0) / reviewed.length)
          : 0;

        setStats({
          averageScore,
          reviewedCount: reviewed.length,
          projectCount: projectList.length,
          deadlineCount: localDeadlines.length
        });
        setReviewedMarks(reviewed);
      } catch (err) {
        console.log("Error fetching dashboard:", err);
      }
    };

    fetchDashboard();
  }, [userEmail]);

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>My Dashboard</h1>
        </div>

        <div className="profile-right">
          <h4>{user?.name}</h4>
          🔔
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="dashboard-stats">

        <div className="dashboard-card">
          <p>Average Reviewed Score</p>
          <h2>{stats.averageScore}/100</h2>
        </div>

        <div className="dashboard-card">
          <p>Projects</p>
          <h2>{stats.projectCount}</h2>
        </div>

        <div className="dashboard-card">
          <p>Deadlines</p>
          <h2>{stats.deadlineCount} Left</h2>
        </div>

        <div className="dashboard-card">
          <p>Reviewed Submissions</p>
          <h2>{stats.reviewedCount}</h2>
        </div>

      </div>

      {/* ===== DEADLINES ===== */}
      <div className="deadline-section">

        <div className="deadline-header-modern">
          <h3>Next Deadlines</h3>
          <span className="view-all">View all →</span>
        </div>

        <div className="deadline-list">
          {deadlines.map((item, index) => (
            <div className="deadline-item" key={index}>

              <div className="deadline-badge">
                {item.days}
              </div>

              <div className="deadline-info">
                <h4>{item.title}</h4>
                <p>{item.date}</p>
              </div>

            </div>
          ))}
        </div>

      </div>

      <div className="reviewed-marks-section">
        <div className="deadline-header-modern">
          <h3>Reviewed Marks</h3>
        </div>

        {reviewedMarks.length === 0 ? (
          <p className="empty-reviewed-state">No reviewed marks yet.</p>
        ) : (
          <div className="reviewed-mark-list">
            {reviewedMarks.map((item) => (
              <div className="reviewed-mark-item" key={item.id}>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.type}</p>
                </div>
                <span className="reviewed-mark-badge">{item.marks}/100</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;