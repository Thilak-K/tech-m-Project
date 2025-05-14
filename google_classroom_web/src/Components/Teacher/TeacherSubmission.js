import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";

const TeacherSubmissions = () => {
  const { classId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};
  const [homeworks, setHomeworks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedHomework, setSelectedHomework] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!classId) {
        setError("Class ID is missing.");
        setLoading(false);
        return;
      }

      if (!userId) {
        setError("User ID is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        // Fetch all homework for the class
        const homeworkResponse = await axios.get(
          `http://localhost:8080/api/homework/class/${classId}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const homeworkData = homeworkResponse.data.data || [];
        setHomeworks(homeworkData);

        // Fetch all submissions for the class
        const submissionsResponse = await axios.get(
          `http://localhost:8080/api/homework/submissions/class/${classId}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const submissionsData = submissionsResponse.data || [];

        // Enrich submissions with student names
        const enrichedSubmissions = await Promise.all(
          submissionsData.map(async (submission) => {
            const userResponse = await axios.get(
              `http://localhost:8080/api/auth/users/${submission.userId}`,
              {
                headers: { "Content-Type": "application/json" },
              }
            );
            const studentName = userResponse.data.name || "Unknown Student";
            return {
              ...submission,
              studentName,
            };
          })
        );

        setSubmissions(enrichedSubmissions);
      } catch (err) {
        setError(
          "Failed to fetch data: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, userId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const isOverdue = (dueDate) => {
    const currentDate = new Date("2025-05-14T14:34:00+05:30"); 
    const due = new Date(dueDate);
    return due < currentDate;
  };

  const getCardColor = (index) => {
    const colors = ["#2ecc71", "#3498db", "#f1c40f", "#e74c3c"]; 
    return colors[index % colors.length];
  };

 
  const getSubmissionsForHomework = (homeworkId) => {
    return submissions.filter((submission) => submission.homeworkId === homeworkId);
  };

  if (loading) {
    return <div className="loading">Loading data...</div>;
  }

  return (
    <div className="teacher-submissions-container">
      <header className="page-header">
        <button onClick={() => navigate("/teacher-dashboard")} className="back-btn">
          <FiArrowLeft size={20} style={{ marginRight: "8px" }} />
          Back to Dashboard
        </button>
        <h1 className="centered-title">Submissions</h1>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="submissions-list-section">
        <h2 className="section-title">Homework Submissions</h2>
        <div className="homework-cards">
          {homeworks.length === 0 ? (
            <p className="no-homework">No homework has been assigned yet.</p>
          ) : (
            homeworks.map((hw, index) => {
              const submissionsForHw = getSubmissionsForHomework(hw._id);
              const isSelected = selectedHomework === hw._id;

              return (
                <div
                  key={hw._id}
                  className="homework-card"
                  style={{ borderLeft: `5px solid ${getCardColor(index)}` }}
                  onClick={() =>
                    setSelectedHomework(isSelected ? null : hw._id)
                  }
                >
                  <div className="card-index">S.No: {index + 1}</div>
                  <h3>{hw.title}</h3>
                  <p className="card-desc">
                    <span className="desc-label">Description: </span>
                    {hw.description}
                  </p>
                  <div className="card-meta">
                    <span>
                      <FiCalendar size={14} style={{ marginRight: "4px" }} />
                      Assigned: {formatDate(hw.assignedDate)}
                    </span>
                    <span className={isOverdue(hw.dueDate) ? "overdue" : ""}>
                      <FiCalendar size={14} style={{ marginRight: "4px" }} />
                      Due: {formatDate(hw.dueDate)}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="submissions-list">
                      {submissionsForHw.length === 0 ? (
                        <p className="no-submissions">
                          No submissions for this homework.
                        </p>
                      ) : (
                        submissionsForHw.map((submission, subIndex) => (
                          <div key={subIndex} className="submission-item">
                            <span className="submission-label">
                              Student: {submission.studentName}
                            </span>
                            <a
                              href={submission.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="submission-link"
                            >
                              View Submission
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
.teacher-submissions-container {
  padding: 24px 32px;
  background-color: #f4f6f8;
  font-family: 'Roboto', sans-serif;
  color: #202124;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 30px;
}

.back-btn {
  background: none;
  border: none;
  color: #1a73e8;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  position: absolute;
  left: 0;
}

.back-btn:hover {
  color: #1557b0;
}

.centered-title {
  font-size: 34px;
  font-weight: 500;
  margin: 0;
  color: #202124;
  text-align: center;
  width: 100%;
}

.error-banner {
  background: #fdeded;
  color: #d93025;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.submissions-list-section {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: box-shadow 0.3s ease;
  max-width: 1400px;
  margin: 0 auto;
}

.submissions-list-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.section-title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #202124;
  text-align: center;
}

.homework-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 50vh;
  overflow-y: auto;
  padding-right: 8px;
}

.homework-card {
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 8px;
  background: #fafafa;
  position: relative;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.homework-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-index {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #e8f0fe;
  color: #174ea6;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.homework-card h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 24px 0 8px 0;
  color: #202124;
  text-align: left;
}

.card-desc {
  font-size: 14px;
  color: #5f6368;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.desc-label {
  font-weight: 500;
  color: #202124;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #5f6368;
}

.card-meta span {
  display: flex;
  align-items: center;
}

.overdue {
  color: #e74c3c;
}

.submissions-list {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.submission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.submission-item:last-child {
  border-bottom: none;
}

.submission-label {
  font-size: 14px;
  color: #202124;
}

.submission-link {
  font-size: 14px;
  color: #1a73e8;
  text-decoration: none;
}

.submission-link:hover {
  text-decoration: underline;
}

.no-submissions {
  text-align: center;
  color: #5f6368;
  font-size: 14px;
  padding: 10px;
  font-style: italic;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #5f6368;
  font-size: 16px;
}

.no-homework {
  text-align: center;
  color: #5f6368;
  font-size: 14px;
  padding: 20px;
  font-style: italic;
}

@media (max-width: 768px) {
  .teacher-submissions-container {
    padding: 16px;
  }

  .submissions-list-section {
    min-width: 100%;
  }

  .homework-cards {
    max-height: 50vh;
  }

  .page-header {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .back-btn {
    position: static;
    margin-bottom: 10px;
  }

  .centered-title {
    margin-top: 0;
  }
}
`;
document.head.appendChild(styleSheet);

export default TeacherSubmissions;