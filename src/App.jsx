import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

// STUDENT
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import Portfolio from "./pages/Portfolio";
import NewPortfolio from "./pages/NewPortfolio";
import Deadlines from "./pages/Deadlines";
import StudentProfile from "./pages/StudentProfile";

// TEACHER
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherSubmissions from "./pages/teacher/TeacherSubmissions";
import TeacherDeadlines from "./pages/teacher/TeacherDeadlines";
import TeacherProfile from "./pages/teacher/TeacherProfile";

// LAYOUTS
import Layout from "./components/Layout";
import TeacherLayout from "./layouts/TeacherLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* STUDENT */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/new" element={<NewPortfolio />} />
          <Route path="/deadlines" element={<Deadlines />} />
          <Route path="/profile" element={<StudentProfile />} />
          </Route>
        </Route>

        {/* TEACHER */}
        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path="/teacher" element={<TeacherLayout />}>

            <Route index element={<TeacherDashboard />} />

            <Route path="submissions" element={<TeacherSubmissions />} />

            <Route path="deadlines" element={<TeacherDeadlines />} />

            {/* ✅ PROFILE FIX */}
            <Route path="profile" element={<TeacherProfile />} />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;