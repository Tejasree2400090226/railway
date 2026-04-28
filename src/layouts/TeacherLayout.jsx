import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function TeacherLayout() {
  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <Sidebar role="teacher" />

      {/* MAIN CONTENT */}
      <div className="main-content">
        <Outlet />
      </div>

    </div>
  );
}

export default TeacherLayout;