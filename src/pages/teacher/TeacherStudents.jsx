import { useEffect, useState } from "react";
import { fetchAllProjects } from "../../services/projectService";

function TeacherStudents() {

  const [students, setStudents] = useState([]);

  useEffect(() => {
    const loadStudents = async () => {
      const result = await fetchAllProjects();
      const allProjects = result.data || [];

      const grouped = allProjects.reduce((acc, project) => {
        const key = (project.ownerEmail || "unknown").trim().toLowerCase();
        if (!acc[key]) {
          acc[key] = {
            name:
              project.ownerName ||
              project.student ||
              (project.ownerEmail ? project.ownerEmail.split("@")[0] : "Student"),
            email: project.ownerEmail || "-",
            projects: [],
            score: 0
          };
        }

        acc[key].projects.push(project);
        return acc;
      }, {});

      const mapped = Object.values(grouped).map((student) => {
        const reviewed = student.projects.filter((project) => Number.isFinite(project.marks));
        const score = reviewed.length
          ? Math.round(reviewed.reduce((sum, project) => sum + (project.marks || 0), 0) / reviewed.length)
          : 0;

        return {
          ...student,
          score
        };
      });

      setStudents(mapped);
    };

    loadStudents();
  }, []);

  return (
    <div className="teacher-students-page">

      <h2>Students & Submitted Projects</h2>

      <div className="students-list">

        {students.map((student, index) => (

          <div key={index} className="student-card">

            <div className="student-left">
              <div className="avatar">
                {student.name.charAt(0)}
              </div>

              <div>
                <h4>{student.name}</h4>
                <p>{student.email}</p>
              </div>
            </div>

            <div className="student-middle">

              <div>
                <h4>
                  {student.projects?.length || 0}
                </h4>
                <p>Projects</p>
              </div>

            </div>

            <div className="student-right">
              <p>Score: {student.score || 0}</p>
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default TeacherStudents;