import { useEffect, useState } from "react";
import { fetchDeadlines } from "../services/deadlineService";

function Deadlines() {

  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const loadDeadlines = async () => {
      const result = await fetchDeadlines(user?.email || "");
      const today = new Date();

      const updated = (result.data || []).map((d) => {
        const due = new Date(d.date);

        const diff = Math.ceil(
          (due - today) / (1000 * 60 * 60 * 24)
        );

        return {
          ...d,
          daysLeft: diff > 0 ? diff : 0
        };
      });

      setDeadlines(updated);
    };

    loadDeadlines();
  }, []);

  return (
    <div className="deadlines-page">

      <h1>Project Deadlines</h1>

      <div className="deadlines-card">

        {deadlines.length === 0 ? (
          <p>No deadlines assigned by teacher</p>
        ) : (
          deadlines.map((d, index) => (

            <div key={d.id} className="deadline-item">

              {/* LEFT */}
              <div className="left">
                <div className="circle">{index + 1}</div>

                <div>
                  <h3>{d.title}</h3>
                  <p>{d.date}</p>

                  <span className="milestone">
                    {d.milestone || "No milestone"}
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="right">
                <span className={`priority ${d.priority}`}>
                  {d.priority}
                </span>

                <span className="days">
                  {d.daysLeft} days
                </span>
              </div>

            </div>

          ))
        )}

      </div>

      {/* CLEAN CSS */}
      <style>{`

        .deadlines-page {
          padding: 30px;
          max-width: 1000px;
          margin: auto;
        }

        .deadlines-card {
          margin-top: 20px;
          background: white;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }

        .deadline-item {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding: 15px;
          border-bottom: 1px solid #eee;
        }

        .deadline-item:last-child {
          border-bottom: none;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .circle {
          width: 35px;
          height: 35px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .milestone {
          font-size: 12px;
          color: #666;
        }

        .right {
          text-align: right;
        }

        .priority {
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 12px;
          text-transform: capitalize;
        }

        .priority.high {
          background: #fee2e2;
          color: #b91c1c;
        }

        .priority.medium {
          background: #fef3c7;
          color: #92400e;
        }

        .priority.low {
          background: #dcfce7;
          color: #166534;
        }

        .days {
          display: block;
          margin-top: 5px;
          font-size: 13px;
          color: #555;
        }

      `}</style>

    </div>
  );
}

export default Deadlines;