import React, { useState } from "react";
import { IoMdDocument } from "react-icons/io";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BsClipboardCheck } from "react-icons/bs";
import { MdAnnouncement } from "react-icons/md";

import TeacherHomework from "./TeacherHomework";
import TeacherSubmission from "./TeacherSubmission";
import TeacherAttendance from "./TeacherAttendence";
import TeacherAnnouncement from "./TeacherAnnoucement";

// Model for Quick Actions
const quickActions = [
  {
    icon: <IoMdDocument size={24} />,
    label: "Homework",
    key: "homework",
  },
  {
    icon: <AiOutlineCheckCircle size={24} />,
    label: "Submissions",
    key: "submissions",
  },
  {
    icon: <BsClipboardCheck size={24} />,
    label: "Attendance",
    key: "attendance",
  },
  {
    icon: <MdAnnouncement size={24} />,
    label: "Announcement",
    key: "announcement",
  },
];

// Dummy class data
const classes = [
  { subject: "General Information", students: 12, bgColor: "#4A90E2" },
  { subject: "Grammar", students: 8, bgColor: "#7B4A9B" },
  { subject: "Vocabulary", students: 15, bgColor: "#50C878" },
  { subject: "Mathematics", students: 10, bgColor: "#FF9500" },
  { subject: "Science", students: 20, bgColor: "#4A90E2" },
  { subject: "History", students: 5, bgColor: "#50C878" },
  { subject: "Literature", students: 18, bgColor: "#C8405A" },
  { subject: "Geography", students: 7, bgColor: "#7B4A9B" },
  { subject: "Art", students: 14, bgColor: "#5A6268" },
  { subject: "Music", students: 9, bgColor: "#C8405A" },
];

const TeacherHome = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const isHovered = (index, key) =>
    hoveredButton[index] && hoveredButton[index] === key;

  const getButtonStyle = (hover, active = false) => ({
    background: hover ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
    border: hover ? "2px solid #555" : "2px solid #ccc",
    color: hover ? "#000" : "#333",
    transform: active ? "scale(0.96)" : hover ? "scale(1.05)" : "scale(1)",
    boxShadow: hover
      ? "0 4px 12px rgba(0,0,0,0.2)"
      : "0 2px 6px rgba(0,0,0,0.1)",
    ...styles.button,
  });

  const openModal = (actionKey, subject) => {
    setSelectedAction(actionKey);
    setSelectedSubject(subject);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAction(null);
    setSelectedSubject(null);
  };

  // Placeholder content for each quick action
  const renderModalContent = () => {
    switch (selectedAction) {
      case "homework":
         return <TeacherHomework />
      case "submissions":
        return  <TeacherSubmission />
      case "attendance":
        return  <TeacherAttendance/>
      case "announcement":
        return  <TeacherAnnouncement />
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {classes.map((classItem, index) => (
          <div
            key={index}
            style={{
              ...styles.card,
              boxShadow:
                hoveredCard === index
                  ? "0 8px 20px rgba(0, 0, 0, 0.15)"
                  : "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div
              style={{
                ...styles.upperDiv,
                backgroundColor: classItem.bgColor,
                border: `2px solid ${classItem.bgColor}`,
              }}
            >
              <div style={styles.cardHeader}>
                <span style={styles.subject}>{classItem.subject}</span>
                <span
                  style={styles.dots}
                  title="More Options"
                  onClick={() => alert("Menu clicked for " + classItem.subject)}
                >
                  ⋮
                </span>
              </div>
              <div style={styles.students}>{classItem.students} students</div>
            </div>

            <div style={styles.lowerDiv}>
              <div style={styles.lowerDivHeading}>Quick Actions</div>
              {quickActions.map((btn) => (
                <button
                  key={btn.key}
                  style={getButtonStyle(isHovered(index, btn.key))}
                  onClick={() => openModal(btn.key, classItem.subject)}
                  onMouseEnter={() => setHoveredButton({ [index]: btn.key })}
                  onMouseLeave={() => setHoveredButton({ [index]: null })}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.96)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                >
                  {btn.icon}
                  <span style={styles.buttonLabel}>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>{selectedAction.toUpperCase()}</h2>
              <button style={styles.closeButton} onClick={closeModal}>
                ×
              </button>
            </div>
            {renderModalContent()}
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
    padding: "10px",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "'Inter', sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "20px",
    maxWidth: "1400px",
    width: "100%",
    marginTop: "30px",
  },
  card: {
    minWidth: "270px",
    borderRadius: "12px",
    overflow: "hidden",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.3s ease",
    backgroundColor: "#fff",
  },
  upperDiv: {
    height: "100px",
    padding: "16px",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
  },
  lowerDiv: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    padding: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(6px)",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    height: "170px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subject: {
    fontSize: "30px",
    fontWeight: "500",
  },
  dots: {
    fontSize: "22px",
    cursor: "pointer",
  },
  students: {
    fontSize: "16px",
    opacity: 0.9,
    marginTop: "5px",
  },
  button: {
    borderRadius: "10px",
    fontSize: "14px",
    width: "calc(50% - 4px)",
    height: "60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    userSelect: "none",
  },
  buttonLabel: {
    fontSize: "16px",
    marginTop: "4px",
    textAlign: "center",
    opacity: 0.95,
    color: "#333",
  },
  lowerDivHeading: {
    width: "100%",
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "6px",
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
    borderRadius: "20px",
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
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "34px",
    cursor: "pointer",
    color: "#333",
  },
  modalContent: {
    color: "#333",
    fontSize: "16px",
  },
  modalList: {
    listStyleType: "disc",
    paddingLeft: "20px",
  },
};

export default TeacherHome;