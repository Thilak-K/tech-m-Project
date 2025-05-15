import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiCalendar, FiX, FiTrash2 } from "react-icons/fi";

const TeacherHomework = () => {
  const { classId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [homeworks, setHomeworks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState(null);

  const fetchHomeworks = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/homework/class/${classId}`, {
        headers: { "Content-Type": "application/json" },
      });
      const fetched = response.data.data || [];
      fetched.sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate));
      setHomeworks(fetched);
      setError("");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to fetch homework.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (classId && userId) {
      fetchHomeworks();
    } else {
      setError("Missing Class or User ID.");
      setLoading(false);
    }
  }, [classId, userId, fetchHomeworks]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000); // Disappear after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handlePost = useCallback(async () => {
    if (!title.trim() || !description.trim() || !dueDate) {
      setError("All fields are required.");
      return;
    }

    const payload = {
      classId,
      title,
      description,
      assignedDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      createdBy:userId
    };

    try {
      const res = await axios.post("http://localhost:8080/api/homework", payload, {
        headers: { "Content-Type": "application/json" },
      });

      const newHomework = res.data.data;
      setHomeworks([newHomework, ...homeworks].sort(
        (a, b) => new Date(b.assignedDate) - new Date(a.assignedDate)
      ));
      setTitle("");
      setDescription("");
      setDueDate("");
      setError("");
      setSuccessMessage("✅ Homework posted successfully!");
      setShowModal(false);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to post homework.";
      setError(message);
    }
  }, [classId, title, description, dueDate, homeworks, userId]);

  const handleCancel = useCallback(() => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setError("");
    setSuccessMessage("");
    setShowModal(false);
  }, []);

  const handleDeleteClick = (homework) => {
    setHomeworkToDelete(homework);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!homeworkToDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/homework/${homeworkToDelete.id}`, {
        headers: { "Content-Type": "application/json" ,
        "userId": userId
        },
      });

      setHomeworks(homeworks.filter((hw) => hw.id !== homeworkToDelete.id));
      setSuccessMessage("✅ Homework deleted successfully!");
      setError("");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to delete homework.";
      setError(message);
    } finally {
      setShowDeleteConfirm(false);
      setHomeworkToDelete(null);
    }
  }, [homeworks, homeworkToDelete, userId]);

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setHomeworkToDelete(null);
  };

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }, []);

  const isOverdue = (dueDate) => {
    const currentDate = new Date("2025-05-14T16:04:00+05:30"); // Updated to match current date and time
    const due = new Date(dueDate);
    return due < currentDate;
  };

  const isFormFilled = title.trim() && description.trim() && dueDate;

  const getCardColor = (index) => {
    const colors = ["#2ecc71", "#3498db", "#f1c40f", "#e74c3c"];
    return colors[index % colors.length];
  };

  if (loading) {
    return <div className="loading">Loading homework data...</div>;
  }

  return (
    <div className="teacher-homework-container">
      <header className="page-header">
        <button onClick={() => navigate("/teacher-dashboard")} className="back-btn">
          <FiArrowLeft size={20} style={{ marginRight: "8px" }} />
          Back to Dashboard
        </button>
        <h1 className="centered-title">Homework</h1>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      <div className="homework-layout">
        <section className="homework-list-section">
          <div className="section-header">
            <h2 className="section-title">Assigned Homework</h2>
            <button className="create-btn" onClick={() => setShowModal(true)}>
              Create Homework
            </button>
          </div>
          <div className="homework-cards">
            {homeworks.length === 0 ? (
              <p className="no-homework">No homework has been assigned yet.</p>
            ) : (
              homeworks.map((hw, index) => (
                <div
                  key={hw.id}
                  className="homework-card"
                  style={{ borderLeft: `5px solid ${getCardColor(index)}` }}
                >
                  <div className="card-index">S.No: {index + 1}</div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(hw)}
                    title="Delete Homework"
                  >
                    <FiTrash2 size={16} />
                  </button>
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
                </div>
              ))
            )}
          </div>
        </section>

        {showModal && (
          <>
            <div className="modal-backdrop" onClick={handleCancel}></div>
            <div className="modal">
              <div className="modal-header">
                <h2>Create New Homework</h2>
                <button className="close-btn" onClick={handleCancel}>
                  <FiX size={20} />
                </button>
              </div>
              <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                <label className="form-label">
                  <span className="input-label">Title</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </label>
                <label className="form-label">
                  <span className="input-label">Description</span>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a description..."
                  ></textarea>
                </label>
                <label className="form-label">
                  <span className="input-label">Due Date</span>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="Due Date"
                  />
                </label>
                <div className="form-buttons">
                  <button
                    className="cancel-btn"
                    onClick={handleCancel}
                    style={{ opacity: isFormFilled ? 1 : 0.5 }}
                  >
                    Cancel
                  </button>
                  <button
                    className="post-hw-btn"
                    onClick={handlePost}
                    style={{ opacity: isFormFilled ? 1 : 0.5 }}
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {showDeleteConfirm && (
          <>
            <div className="modal-backdrop" onClick={handleDeleteCancel}></div>
            <div className="modal">
              <div className="modal-header">
                <h2>Confirm Deletion</h2>
                <button className="close-btn" onClick={handleDeleteCancel}>
                  <FiX size={20} />
                </button>
              </div>
              <div className="modal-content">
                <p>
                  Are you sure you want to delete the homework "
                  {homeworkToDelete?.title}"? This action cannot be undone.
                </p>
                <div className="form-buttons">
                  <button className="cancel-btn" onClick={handleDeleteCancel}>
                    Cancel
                  </button>
                  <button className="delete-confirm-btn" onClick={handleDeleteConfirm}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
.teacher-homework-container {
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

.success-banner {
  background: #e6f9e6;
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
  animation: fadeOut 3s forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; display: none; }
}

.homework-layout {
  max-width: 1400px;
  margin: 0 auto;
}

.homework-list-section {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: box-shadow 0.3s ease;
}

.homework-list-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 500;
  color: #202124;
  text-align: center;
  margin: 0;
}

.create-btn {
  background: #1a73e8;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.create-btn:hover {
  background: #1557b0;
}

.homework-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 70vh;
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

.delete-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  transition: color 0.2s ease;
}

.delete-btn:hover {
  color: #c0392b;
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

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 90%;
  max-width: 500px;
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 500;
  color: #202124;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #5f6368;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #202124;
}

.modal-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.modal-content p {
  font-size: 14px;
  color: #202124;
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
  color: #202124;
  width: 100%;
}

.input-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}

.form-label input,
.form-label textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  background: #f8f9fa;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-label input:focus,
.form-label textarea:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.form-label textarea {
  resize: vertical;
  min-height: 80px;
}

.form-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
}

.cancel-btn {
  background: #e74c3c;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease, opacity 0.3s ease;
}

.cancel-btn:hover {
  background: #c0392b;
}

.post-hw-btn {
  background: #1a73e8;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease, opacity 0.3s ease;
}

.post-hw-btn:hover {
  background: #1557b0;
}

.delete-confirm-btn {
  background: #e74c3c;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.delete-confirm-btn:hover {
  background: #c0392b;
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
  .teacher-homework-container {
    padding: 16px;
  }

  .homework-list-section {
    width: 100%;
  }

  .homework-cards {
    max-height: 60vh;
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

  .section-header {
    flex-direction: column;
    gap: 12px;
  }

  .modal {
    width: 95%;
    max-width: 400px;
  }
}
`;
document.head.appendChild(styleSheet);

export default TeacherHomework;