import React, { useState, useEffect } from "react";
import axios from "axios";

const TeacherHomework = ({ classId }) => {
  const [homeworks, setHomeworks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch existing homework for the class when the component mounts
  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/homework/class/${classId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });
        setHomeworks(response.data.data || []);
        setError("");
      } catch (err) {
        setError("Failed to fetch homework. Please try again.");
        console.error("Error fetching homework:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchHomeworks();
    } else {
      setError("Class ID is missing.");
      setLoading(false);
    }
  }, [classId]);

  const handlePost = async () => {
    if (!title || !description || !dueDate) {
      setError("All fields are required.");
      return;
    }

    const newHomework = {
      classId,
      title,
      description,
      assignedDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
    };

    try {
      const response = await axios.post("http://localhost:8080/api/homework", newHomework, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      setHomeworks([response.data.data, ...homeworks]);
      setTitle("");
      setDescription("");
      setDueDate("");
      setError("");
      alert("Homework posted successfully!");
    } catch (err) {
      setError("Failed to post homework. Please try again.");
      console.error("Error posting homework:", err.response?.data || err.message);
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
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Assign Homework</h2>

      {error && (
        <div style={styles.errorMessage}>
          {error}
          <button style={styles.closeErrorButton} onClick={() => setError("")}>
            ✕
          </button>
        </div>
      )}

      <div style={styles.formContainer}>
        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Homework Title</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter homework title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              placeholder="Enter homework description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Due Date</label>
            <input
              style={styles.input}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} // Prevent past dates
            />
          </div>
          <button style={styles.postButton} onClick={handlePost}>
            Post Homework
          </button>
        </div>
      </div>

      <div style={styles.list}>
        {homeworks.length === 0 ? (
          <p style={styles.noHomework}>No homework assigned yet.</p>
        ) : (
          homeworks.map((hw) => (
            <div key={hw.homeworkId} style={styles.card}>
              <h3 style={styles.cardTitle}>{hw.title}</h3>
              <p style={styles.cardDescription}>{hw.description}</p>
              <div style={styles.cardDetails}>
                <span>
                  <strong>Assigned:</strong> {formatDate(hw.assignedDate)}
                </span>
                <span>
                  <strong>Due:</strong> {formatDate(hw.dueDate)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "32px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "32px",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: "600px",
    marginBottom: "32px",
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    padding: "32px",
  },
  inputGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    color: "#1f2937",
    backgroundColor: "#ffffff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    ":focus": {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    minHeight: "120px",
    resize: "vertical",
    outline: "none",
    color: "#1f2937",
    backgroundColor: "#ffffff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    ":focus": {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  },
  postButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s, transform 0.1s",
    ":hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
    ":active": {
      transform: "translateY(0)",
    },
  },
  list: {
    width: "100%",
    maxWidth: "600px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
    padding: "20px",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#4b5563",
    marginBottom: "12px",
    lineHeight: "1.5",
  },
  cardDetails: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#6b7280",
  },
  errorMessage: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "600px",
  },
  closeErrorButton: {
    background: "none",
    border: "none",
    color: "#dc2626",
    fontSize: "16px",
    cursor: "pointer",
    padding: "0 8px",
  },
  loading: {
    fontSize: "16px",
    color: "#6b7280",
    textAlign: "center",
    padding: "20px",
  },
  noHomework: {
    fontSize: "16px",
    color: "#6b7280",
    textAlign: "center",
    padding: "20px",
  },
};

export default TeacherHomework;