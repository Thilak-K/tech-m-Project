import React, { useState } from "react";

const studentsList = ["Alice", "Bob", "Charlie", "Diana"];

const TeacherAttendance = () => {
  const [attendance, setAttendance] = useState({});

  const toggleAttendance = (student) => {
    setAttendance((prev) => ({
      ...prev,
      [student]: prev[student] === "Present" ? "Absent" : "Present",
    }));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Mark Attendance</h2>
      <ul style={styles.list}>
        {studentsList.map((student) => (
          <li key={student} style={styles.studentRow}>
            <span>{student}</span>
            <button
              onClick={() => toggleAttendance(student)}
              style={{
                ...styles.button,
                backgroundColor:
                  attendance[student] === "Present" ? "#50C878" : "#ccc",
              }}
            >
              {attendance[student] || "Absent"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "20px",
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
  studentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    marginBottom: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  button: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default TeacherAttendance;
