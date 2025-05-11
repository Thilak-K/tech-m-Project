import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const HomeworkSubmission = () => {
  const { homeworkId } = useParams(); // Get homeworkId from URL
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {}; // Get userId passed from StudentHome.js
  const [homework, setHomework] = useState(null);
  const [driveLink, setDriveLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch homework details
  useEffect(() => {
    const fetchHomework = async () => {
      if (!userId) {
        setError("User ID is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/homework/${homeworkId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.message === "Homework retrieved successfully!") {
          setHomework(response.data.data);
        } else {
          setError("Failed to fetch homework details.");
        }
      } catch (err) {
        setError("Failed to fetch homework details: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, [homeworkId, userId]);

  // Handle submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driveLink.trim()) {
      setError("Please provide a Google Drive URL.");
      return;
    }
    if (!driveLink.startsWith("https://drive.google.com/")) {
      setError("Please provide a valid Google Drive URL (must start with https://drive.google.com/).");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/homework/submissions",
        {
          homeworkId,
          classId: homework?.classId,
          userId,
          driveLink,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Homework submitted successfully!") {
        setError("");
        alert("Homework submitted successfully!");
        navigate("/student-home", { state: { userId } }); // Redirect back to StudentHome
      } else {
        setError("Failed to submit homework. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit homework: " + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return <div style={StyleSheet.loading}>Loading...</div>;
  }

  if (!homework) {
    return <div style={StyleSheet.errorMessage}>{error}</div>;
  }

  return (
    <div style={StyleSheet.container}>
      <h1 style={StyleSheet.title}>Submit Homework</h1>
      {error && (
        <div style={StyleSheet.errorMessage}>
          {error}
          <button style={StyleSheet.closeErrorButton} onClick={() => setError("")}>
            ✕
          </button>
        </div>
      )}
      <div style={StyleSheet.homeworkDetails}>
        <h2 style={StyleSheet.homeworkTitle}>{homework.title}</h2>
        <p style={StyleSheet.text}>{homework.description}</p>
        <p style={StyleSheet.text}>
          <strong>Assigned:</strong> {formatDate(homework.assignedDate)}
        </p>
        <p style={StyleSheet.text}>
          <strong>Due:</strong> {formatDate(homework.dueDate)}
        </p>
      </div>
      <form onSubmit={handleSubmit} style={StyleSheet.form}>
        <label style={StyleSheet.label}>
          Google Drive URL:
          <input
            type="url"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            placeholder="https://drive.google.com/..."
            style={StyleSheet.input}
          />
        </label>
        <button type="submit" style={StyleSheet.submitButton}>
          Submit
        </button>
        <button
          type="button"
          style={StyleSheet.cancelButton}
          onClick={() => navigate("/student-dashboard", { state: { userId } })}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

// Simple and professional styles without colors
const StyleSheet = {
  container: {
    padding: "24px",
    fontFamily: "'Roboto', sans-serif",
    minHeight: "100vh",
  },
  title: {
    fontSize: "24px",
    fontWeight: "500",
    marginBottom: "24px",
    textAlign: "center",
  },
  loading: {
    fontSize: "14px",
    textAlign: "center",
    padding: "16px",
  },
  errorMessage: {
    fontSize: "13px",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeErrorButton: {
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "13px",
  },
  homeworkDetails: {
    marginBottom: "24px",
  },
  homeworkTitle: {
    fontSize: "16px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  text: {
    fontSize: "13px",
    marginBottom: "4px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  input: {
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
  },
  submitButton: {
    padding: "8px 16px",
    border: "1px solid #000",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    background: "none",
  },
  cancelButton: {
    padding: "8px 16px",
    border: "1px solid #000",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    background: "none",
  },
};

export default HomeworkSubmission;