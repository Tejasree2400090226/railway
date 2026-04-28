import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  Briefcase,
  CalendarDays,
  LogOut,
  ClipboardList,
  User
} from "lucide-react";
import { logout } from "../services/authService";

function Sidebar({ role = "student" }) {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: role === "teacher" ? "Teacher" : "Student",
    email: "user@email.com"
  };
  const roleLabel = user?.role === "teacher" ? "Teacher" : "Student";
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || roleLabel;
  const secondaryIdentity = user?.name?.trim() ? roleLabel : (user?.email || roleLabel);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // STUDENT MENU
  const studentMenu = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18}/> },
    { name: "Projects", path: "/projects", icon: <Folder size={18}/> },
    { name: "Portfolio", path: "/portfolio", icon: <Briefcase size={18}/> },
    { name: "Deadlines", path: "/deadlines", icon: <CalendarDays size={18}/> },
    { name: "Profile", path: "/profile", icon: <User size={18}/> }
  ];

  // TEACHER MENU
  const teacherMenu = [
    { name: "Overview", path: "/teacher", icon: <LayoutDashboard size={18}/> },
    { name: "Submissions", path: "/teacher/submissions", icon: <ClipboardList size={18}/> },
    { name: "Deadlines", path: "/teacher/deadlines", icon: <CalendarDays size={18}/> },
    { name: "Profile", path: "/teacher/profile", icon: <User size={18}/> }
  ];

  const menu = role === "teacher" ? teacherMenu : studentMenu;

  return (
    <div className="sidebar">

      <div className="sidebar-top">

        <div className="sidebar-header">
          <div className="logo-box">🎓</div>
          <p>{role === "teacher" ? "Teacher Panel" : "Student Portal"}</p>
        </div>

        <ul className="menu">
          {menu.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                {item.icon} {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

      </div>

      <div className="sidebar-bottom">

        <div className="sidebar-profile">
          <div className="profile-avatar">
            {displayName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="profile-info">
            <p>{displayName}</p>
            <span>{secondaryIdentity}</span>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} style={{ marginRight: "6px" }} />
          Sign Out
        </button>

      </div>

    </div>
  );
}

export default Sidebar;