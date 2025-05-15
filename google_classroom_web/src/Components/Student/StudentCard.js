import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiCalendar, FiX, FiEye, FiUpload } from "react-icons/fi";

const StudentCard = () => {
  const { state } = useLocation();
  const { classId, userId } = state || {};
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [driveLink, setDriveLink] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    const fetchClassDetails = async () => {
      console.log("Fetching class details with classId:", classId, "userId:", userId);
      if (!classId || !userId) {
        setError("Class ID or User ID is missing. Please try again.");
        setLoading(false);
        return;
      }

      try {
        // Fetch announcements
        console.log("Fetching announcements for classId:", classId);
        const announcementsResponse = await axios.get(
          `http://localhost:8080/api/announcements/class/${classId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const announcementsData = announcementsResponse.data.data || [];
        announcementsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAnnouncements(announcementsData);

        // Fetch homework
        console.log("Fetching homework for classId:", classId);
        const homeworkResponse = await axios.get(
          `http://localhost:8080/api/homework/class/${classId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const homeworkData = homeworkResponse.data.data || [];
        setHomework(homeworkData);

        // Fetch existing submissions for the user and class
        console.log("Fetching submissions for classId:", classId, "userId:", userId);
        const submissionsResponse = await axios.get(
          `http://localhost:8080/api/homework/submissions/class/${classId}/user/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const submissionsData = submissionsResponse.data.data || [];
        const submissionsMap = {};
        submissionsData.forEach((sub) => {
          submissionsMap[sub.homeworkId] = {
            driveLink: sub.driveLink,
            submittedAt: sub.submittedOn,
          };
        });
        console.log("Updated submissions map:", submissionsMap);
        setSubmissions(submissionsMap);
      } catch (err) {
        console.error("Error fetching class details:", err.message, err.response?.data);
        setError("Failed to fetch class details. Please try again. Details: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId, userId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleOpenModal = (homeworkItem, isReupload = false) => {
    setSelectedHomework(homeworkItem);
    setDriveLink(isReupload ? submissions[homeworkItem.id]?.driveLink || "" : "");
    setSubmissionError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHomework(null);
    setDriveLink("");
    setSubmissionError("");
  };

  const handleSubmitLink = async () => {
    if (!driveLink.trim()) {
      setSubmissionError("Please provide a Google Drive URL.");
      return;
    }
    if (!driveLink.startsWith("https://drive.google.com/")) {
      setSubmissionError("Please provide a valid Google Drive URL (must start with https://drive.google.com/).");
      return;
    }

    try {
      const isReupload = !!submissions[selectedHomework.id];
      const method = isReupload ? "PUT" : "POST";
      const url = isReupload
        ? `http://localhost:8080/api/homework/submissions/${selectedHomework.id}/${userId}`
        : "http://localhost:8080/api/homework/submissions";

      console.log(`Submitting homework (${isReupload ? "reupload" : "new"}):`, { method, url, data: { homeworkId: selectedHomework.id, classId: selectedHomework.classId, userId, driveLink } });

      const response = await axios({
        method,
        url,
        data: {
          homeworkId: selectedHomework.id,
          classId: selectedHomework.classId,
          userId,
          driveLink,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Submission response:", response.data);

      if (response.data.message.includes("successfully")) {
        setSubmissionError("");
        alert(`Homework ${isReupload ? "updated" : "submitted"} successfully!`);
        const updatedSubmission = response.data.data;
        setSubmissions((prev) => {
          const newSubmissions = { ...prev };
          newSubmissions[selectedHomework.id] = {
            driveLink: updatedSubmission.driveLink,
            submittedAt: updatedSubmission.submittedOn,
          };
          console.log("Updated submissions state:", newSubmissions);
          return newSubmissions;
        });
        handleCloseModal();
      } else {
        setSubmissionError(`Failed to ${isReupload ? "update" : "submit"} homework. Please try again.`);
      }
    } catch (err) {
      console.error("Error submitting homework:", err.message, err.response?.data);
      setSubmissionError(
        `Failed to ${submissions[selectedHomework.id] ? "update" : "submit"} homework: ` +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleViewSubmission = (driveLink) => {
    window.open(driveLink, "_blank");
  };

  const getCardColor = (index) => {
    const colors = ["#2ecc71", "#3498db", "#f1c40f", "#e74c3c"];
    return colors[index % colors.length];
  };

  if (loading) {
    return <div className="loading">Loading class details...</div>;
  }

  return (
    <div className="student-card-container">
      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft size={20} style={{ marginRight: "8px" }} />
          Back to Classes
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="content-wrapper">
        {/* Left Section: Announcements */}
        <div className="left-section">
          <div className="section-header">
            <h2 className="section-title">Announcements</h2>
          </div>
          <div className="scrollable-content">
            {announcements.length === 0 ? (
              <p className="no-data-text">No announcements yet.</p>
            ) : (
              announcements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className="item-card"
                  style={{ borderLeft: `5px solid ${getCardColor(index)}` }}
                >
                  <div className="card-header">
                    <h3>{announcement.title}</h3>
                  </div>
                  <p className="card-desc">
                    <span className="desc-label">Description: </span>
                    {announcement.description}
                  </p>
                  <div className="card-meta">
                    <span>
                      <FiCalendar size={14} style={{ marginRight: "4px" }} />
                      Created: {formatDate(announcement.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Section: Homework */}
        <div className="right-section">
          <div className="section-header">
            <h2 className="section-title">Homework</h2>
          </div>
          <div className="scrollable-content">
            {homework.length === 0 ? (
              <p className="no-data-text">No homework assigned yet.</p>
            ) : (
              homework.map((hw, index) => (
                <div
                  key={hw.id}
                  className="item-card"
                  style={{ borderLeft: `5px solid ${getCardColor(index)}` }}
                >
                 
                  <div className="card-header">
                    
                    <h3>{hw.title}</h3>
                  </div>
                  <p className="card-desc">
                    <span className="desc-label">Description: </span>
                    {hw.description}
                  </p>
                  <div className="card-meta">
                    <span>
                      <FiCalendar size={14} style={{ marginRight: "4px" }} />
                      Assigned: {formatDate(hw.assignedDate)}
                    </span>
                    <span>
                      <FiCalendar size={14} style={{ marginRight: "4px" }} />
                      Due: {formatDate(hw.dueDate)}
                    </span>
                  </div>
                  <div className="homework-actions">
                    {submissions[hw.id] ? (
                      <>
                        <button
                          className="view-button"
                          onClick={() => handleViewSubmission(submissions[hw.id].driveLink)}
                        >
                          <FiEye size={16} style={{ marginRight: "4px" }} />
                          View Submission
                        </button>
                        <button
                          className="reupload-button"
                          onClick={() => handleOpenModal(hw, true)}
                        >
                          <FiUpload size={16} style={{ marginRight: "4px" }} />
                          Reupload
                        </button>
                      </>
                    ) : (
                      <button
                        className="submit-button"
                        onClick={() => handleOpenModal(hw)}
                      >
                        Submit via Google Drive
                      </button>
                    )}
                  </div>
                  {submissions[hw.id] && (
                    <div className="submission-info">
                      Submitted on: {formatDate(submissions[hw.id].submittedAt)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {showModal && selectedHomework && (
        <>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
          <div className="modal">
            <div className="modal-header">
              <h2>{submissions[selectedHomework.id] ? "Reupload Homework" : "Submit Homework"}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-content">
              <p>Enter the Google Drive link for your submission:</p>
              <div className="form-label">
                <input
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="modal-input"
                />
              </div>
              {submissionError && <p className="modal-error">{submissionError}</p>}
              <div className="form-buttons">
                <button className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button className="submit-modal-button" onClick={handleSubmitLink}>
                  {submissions[selectedHomework.id] ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
.student-card-container {
  padding: 0;
  background-color: #f9f9fb;
  font-family: 'Inter', sans-serif;
  color: #2d3748;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.back-button-container {
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 20px;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.back-btn:hover {
  color: #2563eb;
  background: #eff6ff;
  transform: translateX(-2px);
}

.error-banner {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 40px;
  font-size: 14px;
  text-align: center;
  border-bottom: 1px solid #fee2e2;
  font-weight: 500;
}

.content-wrapper {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  max-width: 1440px;
  margin: 32px auto;
  padding: 0 40px;
  flex: 1;
}

.left-section,
.right-section {
  flex: 1;
  min-width: 600px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 24px;
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.left-section:hover,
.right-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin: 0;
  margin-bottom: 16px;
  position: relative;
}

.section-title::after {
  content: '';
  width: 50px;
  height: 4px;
  background: #3b82f6;
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 2px;
}

.scrollable-content {
  flex: 1;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}

.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.no-data-text {
  text-align: center;
  color: #6b7280;
  font-size: 15px;
  padding: 24px;
  font-style: italic;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

.item-card {
  border: 1px solid #e5e7eb;
  padding: 20px;
  border-radius: 10px;
  background: #ffffff;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

.item-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  position: relative;
}

.card-index {
  background: #eff6ff;
  color: #1e40af;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  line-height: 1;
}

.item-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
  flex: 1;
  word-break: break-word;
}

.card-desc {
  font-size: 14px;
  color: #4b5563;
  margin: 0 0 12px 0;
  line-height: 1.6;
  word-break: break-word;
}

.desc-label {
  font-weight: 600;
  color: #1f2937;
}

.card-meta {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.card-meta span {
  display: flex;
  align-items: center;
}

.submit-button,
.view-button,
.reupload-button {
  border: none;
  margin-bottom:10px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.submit-button {
  background: #3b82f6;
  color: #ffffff;
}

.submit-button:hover {
  background: #2563eb;
  transform: scale(1.03);
}

.view-button {
  background: #10b981;
  color: #ffffff;
}

.view-button:hover {
  background: #059669;
  transform: scale(1.03);
}

.reupload-button {
  background: #f59e0b;
  color: #ffffff;
}

.reupload-button:hover {
  background: #d97706;
  transform: scale(1.03);
}

.submission-info {
  font-size: 13px;
  color: #6b7280;
  margin-top: 12px;
  font-style: italic;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  padding: 24px;
  width: 90%;
  max-width: 500px;
  z-index: 1001;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -45%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s ease, transform 0.2s ease;
}

.close-btn:hover {
  color: #1f2937;
  transform: rotate(90deg);
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.modal-content p {
  font-size: 14px;
  color: #4b5563;
  text-align: center;
  margin: 0;
}

.form-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  width: 100%;
}

.modal-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: #f9fafb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-error {
  color: #dc2626;
  font-size: 14px;
  text-align: center;
  margin: 0;
  background: #fef2f2;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
}

.form-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
  margin-top: 8px;
}

.cancel-btn {
  background: #ef4444;
  color: #ffffff;
  border: none;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.cancel-btn:hover {
  background: #dc2626;
  transform: scale(1.03);
}

.submit-modal-button {
  background: #3b82f6;
  color: #ffffff;
  border: none;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.submit-modal-button:hover {
  background: #2563eb;
  transform: scale(1.03);
}

.loading {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-size: 16px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .student-card-container {
    padding: 0;
  }

  .back-button-container {
    padding: 16px 20px;
  }

  .content-wrapper {
    padding: 0 20px;
    margin: 20px auto;
  }

  .left-section,
  .right-section {
    min-width: 100%;
  }

  .section-header {
    gap: 8px;
  }

  .modal {
    width: 95%;
    max-width: 400px;
  }

  .homework-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .submit-button,
  .view-button,
  .reupload-button {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}
`;
document.head.appendChild(styleSheet);

export default StudentCard;