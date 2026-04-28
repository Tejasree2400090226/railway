import { useEffect, useState } from "react";
import { fetchAllProjects } from "../../services/projectService";

function TeacherProfile() {

  const [teacher, setTeacher] = useState({});
  const [projects, setProjects] = useState([]);
  const [image, setImage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};

    setTeacher(user);

    const loadProjects = async () => {
      const result = await fetchAllProjects();
      setProjects(result.data || []);
    };

    loadProjects();

    const savedImage = localStorage.getItem("teacherProfileImage");
    if (savedImage) setImage(savedImage);
  }, []);

  // 📊 CALCULATIONS
  let totalStudents = new Set(
    projects
      .map((p) => (p.ownerEmail || "").trim().toLowerCase())
      .filter(Boolean)
  ).size;

  let reviewed = projects.filter(
    p => p.status === "Reviewed"
  ).length;

  let pending = projects.length - reviewed;

  let milestones = new Set();
  projects.forEach((project) => {
    (project.milestones || []).forEach((milestone) => milestones.add(milestone.name));
  });

  const roleLabel = teacher?.role === "student" ? "Student" : "Teacher";
  const roleSubtitle =
    roleLabel === "Teacher"
      ? "Professor • CSE Department"
      : "Student • CSE Department";

  // 📷 IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      localStorage.setItem("teacherProfileImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="teacher-profile">

      <h1 className="page-title">Teacher Profile</h1>

      {/* PROFILE CARD */}
      <div className="profile-card">

        <div className="avatar-wrapper">
          {image ? (
            <img src={image} className="avatar-img" />
          ) : (
            <div className="avatar">
              {teacher?.name?.charAt(0).toUpperCase() || "T"}
            </div>
          )}

          <label className="upload-icon">
            📷
            <input type="file" hidden onChange={handleImageUpload} />
          </label>
        </div>

        <div className="profile-info">
          <h2>{teacher.name || "Teacher Name"}</h2>
          <p>{teacher.email || "email@gmail.com"}</p>
          <span>{roleSubtitle}</span>
          <div className="role-chip">{roleLabel}</div>
        </div>

      </div>

      {/* STATS */}
      <div className="stats-grid">

        <div className="stat-card blue">
          <span>Total Students</span>
          <b>{totalStudents}</b>
        </div>

        <div className="stat-card green">
          <span>Reviews Done</span>
          <b>{reviewed}</b>
        </div>

        <div className="stat-card orange">
          <span>Pending Reviews</span>
          <b>{pending}</b>
        </div>

        <div className="stat-card purple">
          <span>Milestones Covered</span>
          <b>{milestones.size}</b>
        </div>

      </div>

      {/* CSS */}
      <style>{`

        body {
          overflow-x: hidden;
          font-family: 'Poppins', sans-serif;
        }

        .teacher-profile {
          padding: 30px;
          background: #f4f6fb;
          min-height: 100vh;

          /* 🔥 FIX CENTER + NO OVERFLOW */
          max-width: 1100px;
          margin: auto;
          box-sizing: border-box;
        }

        .page-title {
          margin-bottom: 25px;
          font-weight: 600;
        }

        /* PROFILE CARD */
        .profile-card {
          display: flex;
          align-items: center;
          gap: 20px;

          width: 100%;
          overflow: hidden;

          background: white;
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        /* AVATAR FIX */
        .avatar-wrapper {
          position: relative;
          width: 90px;
          height: 90px;
          flex-shrink: 0;
        }

        .avatar,
        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;

          background: linear-gradient(135deg,#4facfe,#00f2fe);
          display: flex;
          align-items: center;
          justify-content: center;

          color: white;
          font-size: 28px;
          font-weight: bold;
        }

        /* CAMERA ICON */
        .upload-icon {
          position: absolute;
          bottom: 0;
          right: 0;

          background: #2b3f8f;
          color: white;
          border-radius: 50%;
          padding: 6px;
          font-size: 13px;

          cursor: pointer;
        }

        .profile-info h2 {
          margin-bottom: 4px;
        }

        .profile-info p {
          color: #666;
          font-size: 14px;
        }

        .profile-info span {
          font-size: 13px;
          color: #888;
        }

        .role-chip {
          margin-top: 10px;
          display: inline-block;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 999px;
        }

        /* STATS */
        .stats-grid {
          margin-top: 25px;

          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
          gap: 20px;
        }

        .stat-card {
          padding: 22px;
          border-radius: 16px;
          color: white;
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          transition: 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-3px);
        }

        .stat-card span {
          font-size: 13px;
          opacity: 0.9;
        }

        .stat-card b {
          display: block;
          font-size: 26px;
          margin-top: 6px;
        }

        /* COLORS */
        .blue { background: linear-gradient(135deg,#3b82f6,#1d4ed8); }
        .green { background: linear-gradient(135deg,#22c55e,#15803d); }
        .orange { background: linear-gradient(135deg,#f59e0b,#b45309); }
        .purple { background: linear-gradient(135deg,#8b5cf6,#6d28d9); }

      `}</style>

    </div>
  );
}

export default TeacherProfile;