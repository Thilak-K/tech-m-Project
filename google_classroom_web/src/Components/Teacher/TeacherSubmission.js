import React from "react";

const dummySubmissions = [
  { id: 1, student: "Alice", assignment: "Grammar Practice", submittedAt: "May 7, 2025 9:30 AM", status: "Submitted" },
  { id: 2, student: "Bob", assignment: "Vocabulary Quiz", submittedAt: "May 7, 2025 10:15 AM", status: "Late" },
];

const TeacherSubmission = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Submissions</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Assignment</th>
            <th>Submitted At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {dummySubmissions.map((submission) => (
            <tr key={submission.id}>
              <td>{submission.student}</td>
              <td>{submission.assignment}</td>
              <td>{submission.submittedAt}</td>
              <td style={{ color: submission.status === "Late" ? "red" : "green" }}>{submission.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f0f0f0",
    padding: "10px",
    textAlign: "left",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
  },
};

export default TeacherSubmission;
