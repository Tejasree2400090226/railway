import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DashboardLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;