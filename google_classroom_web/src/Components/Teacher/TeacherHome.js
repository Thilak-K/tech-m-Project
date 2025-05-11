import React, { useState, useEffect } from "react";
import { IoMdDocument } from "react-icons/io";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BsClipboardCheck } from "react-icons/bs";
import { MdAnnouncement } from "react-icons/md";
import axios from 'axios';

import TeacherHomework from "./TeacherHomework";
import TeacherSubmission from "./TeacherSubmission";
import TeacherAttendance from "./TeacherAttendence";
import TeacherAnnouncement from "./TeacherAnnoucement";

// Model for Quick Actions
const quickActions = [
  {
    icon: <IoMdDocument size={20} />,
    label: "Homework",
    key: "homework",
  },
  {
    icon: <AiOutlineCheckCircle size={20} />,
    label: "Submissions",
    key: "submissions",
  },
  {
    icon: <BsClipboardCheck size={20} />,
    label: "Attendance",
    key: "attendance",
  },
  {
    icon: <MdAnnouncement size={20} />,
    label: "Announcement",
    key: "announcement",
  },
];

const TeacherHome = ({ userId }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classes, setClasses] = useState([]); 
  const [userNames, setUserNames] = useState({}); 
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  const isHovered = (index, key) =>
    hoveredButton[index] && hoveredButton[index] === key;

  const getButtonStyle = (hover, active = false) => ({
    background: hover ? "#e6f0ff" : "rgba(255, 255, 255, 0.1)",
    border: hover ? "1px solid #4A90E2" : "1px solid #e0e0e0",
    color: hover ? "#4A90E2" : "#555",
    transform: active ? "scale(0.95)" : hover ? "scale(1.02)" : "scale(1)",
    boxShadow: hover ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none",
    ...styles.button,
  });

  const formatDate = (createdAt) => {
    const timestamp = createdAt?.$date?.$numberLong
      ? parseInt(createdAt.$date.$numberLong, 10)
      : createdAt;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const openModal = (actionKey, classId) => {
    setSelectedAction(actionKey);
    setSelectedClassId(classId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAction(null);
    setSelectedClassId(null);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log(`Fetching classes for userId: "${userId}"`);
        const createdResponse = await axios.get('http://localhost:8080/api/classes', {
          params: { userId, type: "created" }
        });
        const joinedResponse = await axios.get('http://localhost:8080/api/classes', {
          params: { userId, type: "joined" }
        });

        const createdClasses = createdResponse.data.data || [];
        const joinedClasses = joinedResponse.data.data || [];
        const allClasses = [...createdClasses, ...joinedClasses];

        console.log('Fetched classes:', allClasses);
        setClasses(allClasses);
        setError(null);

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
      } catch (err) {
        setError('Failed to load classes. Please try again later.');
        console.error('Error fetching classes:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (typeof userId === 'string' && userId.trim() !== '') {
      setLoading(true);
      fetchClasses();
    } else {
      setLoading(false);
      setError('User ID is missing. Please log in again.');
      console.error('No valid userId provided to fetch classes:', userId);
    }
  }, [userId]);

  const handleDeleteClass = async () => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/classes/${classToDelete.classId}`, {
        params: { userId }
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
  };

  const renderModalContent = () => {
    switch (selectedAction) {
      case "homework":
        return <TeacherHomework classId={selectedClassId} />;
      case "submissions":
        return <TeacherSubmission classId={selectedClassId} />;
      case "attendance":
        return <TeacherAttendance classId={selectedClassId} />;
      case "announcement":
        return <TeacherAnnouncement classId={selectedClassId} />;
      default:
        return null;
    }
  };

  if (!userId) {
    return <div style={{ textAlign: "center", padding: "20px" }}>User ID is missing. Please log in again.</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#333' }}>Loading classes...</p>
        ) : error ? (
          <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
            {error}
          </div>
        ) : classes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#333' }}>No classes found. Create or join a class to get started.</p>
        ) : (
          classes.map((classItem, index) => (
            <div
              key={classItem.classId}
              style={{
                ...styles.card,
                boxShadow: hoveredCard === index
                  ? "0 6px 16px rgba(0, 0, 0, 0.15)"
                  : "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.upperDiv}>
                <div style={styles.cardHeader}>
                  <h1 style={styles.subject}>
                    {classItem.subject} ({classItem.classCode})
                  </h1>
                  {classItem.userId === userId && (
                    <span
                      style={styles.dots}
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
                <div style={styles.section}>
                  Section: {classItem.section}
                </div>
                <div style={styles.createdInfo}>
                  By {userNames[classItem.userId] || 'Loading...'} | {formatDate(classItem.createdAt)}
                </div>
              </div>

              <div style={styles.lowerDiv}>
                <div style={styles.lowerDivHeading}>Quick Actions</div>
                <div style={styles.buttonGrid}>
                  {quickActions.map((btn) => (
                    <button
                      key={btn.key}
                      style={getButtonStyle(isHovered(index, btn.key))}
                      onClick={() => openModal(btn.key, classItem.classId)}
                      onMouseEnter={() => setHoveredButton({ [index]: btn.key })}
                      onMouseLeave={() => setHoveredButton({ [index]: null })}
                      onMouseDown={(e) =>
                        (e.currentTarget.style.transform = "scale(0.95)")
                      }
                      onMouseUp={(e) =>
                        (e.currentTarget.style.transform = "scale(1.02)")
                      }
                    >
                      {btn.icon}
                      <span style={styles.buttonLabel}>{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>{selectedAction?.toUpperCase()}</h2>
              <button style={styles.closeButton} onClick={closeModal}>
                ×
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>Confirm Deletion</h2>
              <button style={styles.closeButton} onClick={() => setShowDeleteConfirm(false)}>
                ×
              </button>
            </div>
            <div style={styles.modalContent}>
              <p>Are you sure you want to delete the class "{classToDelete?.subject}"?</p>
              <div style={styles.modalActions}>
                <button
                  style={styles.cancelButton}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  style={styles.deleteButton}
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

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "30px",
    backgroundColor: "#f7f9fc",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    maxWidth: "1200px",
    width: "100%",
    marginTop: "20px",
    boxSizing: "border-box",
  },
  card: {
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.3s ease, transform 0.2s ease",
  },
  upperDiv: {
    height:'30%',
    background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
    padding: "12px",
    color: "#fff",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  subject: {
    fontSize: "24px",
    fontWeight: "600",
    margin: 0,
    lineHeight: "1.3",
  },
  section: {
    fontSize: "16px",
    fontWeight: "500",
    opacity: 0.9,
    marginBottom: "4px",
  },
  createdInfo: {
    fontSize: "14px",
    opacity: 0.8,
  },
  dots: {
    fontSize: "18px",
    cursor: "pointer",
    padding: "2px 6px",
    borderRadius: "4px",
    transition: "background-color 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  },
  lowerDiv: {
    padding: "10px",
    backgroundColor: "#fff",
    borderBottomLeftRadius: "10px",
    borderBottomRightRadius: "10px",
  },
  lowerDivHeading: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
  },
  button: {
    borderRadius: "10px",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: '1px solid #000000',
    marginTop:'10px',
    userSelect: "none",
  },
  buttonLabel: {
    fontSize: "16px",
    marginTop: "4px",
    textAlign: "center",
    fontWeight: "500",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    width: "500px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    padding: "20px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "10px",
    marginBottom: "15px",
  },
  deleteButton: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "30px",
    cursor: "pointer",
    color: "#333",
  },
};

export default TeacherHome;