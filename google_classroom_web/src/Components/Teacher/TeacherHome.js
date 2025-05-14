import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdDocument } from "react-icons/io";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BsClipboardCheck } from "react-icons/bs";
import { MdAnnouncement } from "react-icons/md";
import axios from 'axios';

const quickActions = [
  { icon: <IoMdDocument size={20} />, label: "Homework", key: "homework" },
  { icon: <AiOutlineCheckCircle size={20} />, label: "Submissions", key: "submissions" },
  { icon: <BsClipboardCheck size={20} />, label: "Attendance", key: "attendance" },
  { icon: <MdAnnouncement size={20} />, label: "Announcements", key: "announcements" },
];

const TeacherHome = ({ userId, refreshClasses }) => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState({});
  const [classes, setClasses] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [studentCounts, setStudentCounts] = useState({});

  const formatDate = useCallback((createdAt) => {
    const timestamp = createdAt?.$date?.$numberLong
      ? parseInt(createdAt.$date.$numberLong, 10)
      : createdAt;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  }, []);

  const handleActionClick = useCallback((actionKey, classId) => {
    if (actionKey === "homework") {
      navigate(`/teacher/class/${classId}/${actionKey}`, { state: { userId } });
    } else if (actionKey === "announcements") {
      navigate(`/teacher/class/${classId}/announcements`, { state: { userId } });
    } else if (actionKey === "submissions") {
      navigate(`/teacher/class/${classId}/submissions`, { state: { userId } });
    } else if (actionKey === "attendance") {
      navigate(`/teacher/class/${classId}/attendance`, { state: { userId } });
    }
  }, [navigate, userId]);

  useEffect(() => {
    const fetchClassesAndStudents = async () => {
      try {
        const createdResponse = await axios.get('http://localhost:8080/api/classes', {
          params: { userId, type: "created" },
        });
        const joinedResponse = await axios.get('http://localhost:8080/api/classes', {
          params: { userId, type: "joined" },
        });

        const createdClasses = createdResponse.data.data || [];
        const joinedClasses = joinedResponse.data.data || [];
        const allClasses = [...createdClasses, ...joinedClasses];
        setClasses(allClasses);

        const userIds = [...new Set(allClasses.map(cls => cls.userId))];
        const userNamePromises = userIds.map(async (uid) => {
          try {
            const userResponse = await axios.get(`http://localhost:8080/api/auth/users/${uid}`);
            return { userId: uid, name: userResponse.data.name || 'Unknown' };
          } catch (err) {
            console.error(`Error fetching user ${uid}:`, err);
            return { userId: uid, name: 'Unknown' };
          }
        });

        const userNameResults = await Promise.all(userNamePromises);
        const userNameMap = userNameResults.reduce((acc, { userId, name }) => {
          acc[userId] = name;
          return acc;
        }, {});
        setUserNames(userNameMap);

        const studentCountPromises = allClasses.map(async (cls) => {
          try {
            const studentResponse = await axios.get(`http://localhost:8080/api/classes/${cls.classId}/students`);
            return { classId: cls.classId, count: studentResponse.data.data?.length || 0 };
          } catch (err) {
            console.error(`Error fetching students for class ${cls.classId}:`, err);
            return { classId: cls.classId, count: 0 };
          }
        });

        const studentCountResults = await Promise.all(studentCountPromises);
        const studentCountMap = studentCountResults.reduce((acc, { classId, count }) => {
          acc[classId] = count;
          return acc;
        }, {});
        setStudentCounts(studentCountMap);

        setError(null);
      } catch (err) {
        setError('Failed to load classes. Please try again later.');
        console.error('Error fetching classes:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (typeof userId === 'string' && userId.trim() !== '') {
      setLoading(true);
      fetchClassesAndStudents();
    } else {
      setLoading(false);
      setError('User ID is missing. Please log in again.');
    }
  }, [userId, refreshClasses]);

  const handleDeleteClass = useCallback(async () => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/classes/${classToDelete.classId}`, {
        params: { userId },
      });
      if (response.status === 200) {
        setClasses(classes.filter(cls => cls.classId !== classToDelete.classId));
        setError(null);
      }
    } catch (err) {
      setError('Failed to delete class. Please try again.');
      console.error('Error deleting class:', err.response?.data || err.message);
    } finally {
      setShowDeleteConfirm(false);
      setClassToDelete(null);
    }
  }, [classToDelete, classes, userId]);

  const getCardColor = (index) => {
    const colors = [
      { start: '#2ecc71', end: '#27ae60' }, // Green
      { start: '#3498db', end: '#2980b9' }, // Blue
      { start: '#f1c40f', end: '#e67e22' }, // Yellow
      { start: '#e74c3c', end: '#c0392b' }, // Red
    ];
    return colors[index % colors.length];
  };

  if (!userId) {
    return <div className="error-message">User ID is missing. Please log in again.</div>;
  }

  return (
    <div className="teacher-home-container">
      <div className="class-grid">
        {loading ? (
          <p className="loading-text">Loading classes...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : classes.length === 0 ? (
          <p className="no-classes-text">No classes found. Create or join a class to get started.</p>
        ) : (
          classes.map((classItem, index) => {
            const cardColor = getCardColor(index);
            return (
              <div
                key={classItem.classId}
                className={`class-card ${hoveredCard === index ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className="upper-div"
                  style={{
                    background: `linear-gradient(135deg, ${cardColor.start} 0%, ${cardColor.end} 100%)`,
                  }}
                >
                  <div className="card-header">
                    <h1 className="subject">
                      {classItem.subject} - {classItem.classCode}
                    </h1>
                    {classItem.userId === userId && (
                      <span
                        className="dots"
                        title="Delete Class"
                        onClick={() => {
                          setClassToDelete(classItem);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        ⋮
                      </span>
                    )}
                  </div>
                  <div className="section">
                    Section: {classItem.section}
                  </div>
                  <div className="student-count">
                    Students: {studentCounts[classItem.classId] || 0}
                  </div>
                  <div className="created-info">
                    Created by {userNames[classItem.userId] || 'Loading...'} | {formatDate(classItem.createdAt)}
                  </div>
                </div>

                <div className="lower-div">
                  <div className="lower-div-heading">Quick Actions</div>
                  <div className="button-grid">
                    {quickActions.map((btn) => {
                      const isButtonHovered = hoveredButton[index] === btn.key;
                      return (
                        <button
                          key={btn.key}
                          className={`action-button ${isButtonHovered ? "hovered" : ""}`}
                          onClick={() => handleActionClick(btn.key, classItem.classId)}
                          onMouseEnter={() => setHoveredButton({ ...hoveredButton, [index]: btn.key })}
                          onMouseLeave={() => setHoveredButton({ ...hoveredButton, [index]: null })}
                        >
                          {btn.icon}
                          <span className="button-label">{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button className="close-button" onClick={() => setShowDeleteConfirm(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete the class "{classToDelete?.subject}"?</p>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="delete-button"
                  onClick={handleDeleteClass}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
  .teacher-home-container {
    display: flex;
    justify-content: center;
    padding: 30px;
    background-color: #f7f9fc;
    min-height: 100vh;
    width: 100%;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
  }
  .class-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    max-width: 1200px;
    width: 100%;
    margin-top: 20px;
    box-sizing: border-box;
  }
  .class-card {
    width: 380px;
    height: 400px;
    border-radius: 12px;
    overflow: hidden;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.3s ease, transform 0.2s ease;
  }
  .class-card.hovered {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
  }
  .upper-div {
    height: 35%;
    padding: 15px;
    color: #fff;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .subject {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
    font-family: 'Inter', sans-serif;
  }
  .section {
    font-size: 16px;
    font-weight: 500;
    opacity: 0.9;
    margin-bottom: 10px;
  }
  .student-count {
    position: absolute;
    bottom: 15px;
    right: 15px;
    font-size: 14px;
    font-weight: 500;
    opacity: 0.9;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 5px 10px;
    border-radius: 8px;
  }
  .created-info {
    font-size: 14px;
    opacity: 0.8;
    margin-top: 10px;
  }
  .dots {
    font-size: 28px;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }
  .dots:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  .lower-div {
    flex: 1;
    padding: 15px;
    background-color: #fff;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .lower-div-heading {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
  }
  .button-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    width: 100%;
    max-width: 350px;
  }
  .action-button {
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #e0e0e0;
    background: #ffffff;
    color: #555;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  .action-button.hovered {
    background: #e6f0ff;
    border: 1px solid #4A90E2;
    color: #4A90E2;
    transform: scale(1.03);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .action-button:active {
    transform: scale(0.97);
  }
  .button-label {
    font-size: 16px;
    margin-top: 6px;
    text-align: center;
    font-weight: 500;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal {
    background-color: #fff;
    border-radius: 15px;
    width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    padding: 20px;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }
  .modal-content {
    padding: 10px 0;
  }
  .modal-content p {
    font-size: 1rem;
    color: #333;
    margin-bottom: 20px;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  .close-button {
    background: none;
    border: none;
    font-size: 30px;
    cursor: pointer;
    color: #333;
    transition: color 0.2s ease;
  }
  .close-button:hover {
    color: #e74c3c;
  }
  .cancel-button {
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    background-color: #3498db;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  .cancel-button:hover {
    background-color: #2980b9;
  }
  .delete-button {
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    background-color: #e74c3c;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  .delete-button:hover {
    background-color: #c0392b;
  }
  .loading-text {
    text-align: center;
    color: #333;
    font-size: 1.1rem;
    font-style: italic;
  }
  .no-classes-text {
    text-align: center;
    color: #333;
    font-size: 1.1rem;
    font-style: italic;
  }
  .error-message {
    color: #e74c3c;
    text-align: center;
    margin-bottom: 20px;
    font-size: 1rem;
    font-weight: 500;
  }
  @media (max-width: 1000px) {
    .class-grid {
      gap: 15px;
      max-width: 900px;
    }
    .class-card {
      width: 320px;
      height: 360px;
    }
    .upper-div {
      padding: 12px;
    }
    .subject {
      font-size: 20px;
    }
    .section {
      font-size: 14px;
      margin-bottom: 8px;
    }
    .student-count {
      font-size: 12px;
      padding: 4px 8px;
      bottom: 12px;
      right: 12px;
    }
    .created-info {
      font-size: 12px;
      margin-top: 8px;
    }
    .dots {
      font-size: 24px;
      padding: 2px 6px;
    }
    .lower-div {
      padding: 12px;
    }
    .lower-div-heading {
      font-size: 16px;
      margin-bottom: 12px;
    }
    .button-grid {
      gap: 8px;
      max-width: 300px;
    }
    .action-button {
      padding: 8px;
    }
    .button-label {
      font-size: 14px;
      margin-top: 4px;
    }
  }
  @media (max-width: 600px) {
    .class-grid {
      gap: 10px;
      max-width: 100%;
      padding: 0 10px;
    }
    .class-card {
      width: 100%;
      height: 340px;
    }
  }
`;
document.head.appendChild(styleSheet);

export default TeacherHome;