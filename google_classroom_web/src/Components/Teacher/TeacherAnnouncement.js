import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

const TeacherAnnouncement = () => {
  const { classId } = useParams(); 
  const location = useLocation();
  const { userId } = location.state || {}; 
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch announcements for the class
  useEffect(() => {
    const fetchAnnouncements = async () => {
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
        const response = await axios.get(
          `http://localhost:8080/api/announcements/class/${classId}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        setAnnouncements(response.data);
      } catch (err) {
        setError(
          "Failed to fetch announcements: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [classId, userId]);

  // Handle announcement creation
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Announcement title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Announcement description is required.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/announcements",
        {
          title,
          description,
          classId,
          userId,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.message === "Announcement created successfully!") {
        setTitle("");
        setDescription("");
        setError("");
        setAnnouncements([response.data.data, ...announcements]);
      } else {
        setError("Failed to create announcement.");
      }
    } catch (err) {
      setError(
        "Failed to create announcement: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Format the creation date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div style={StyleSheet.loading}>Loading...</div>;
  }

  if (!userId || !classId) {
    return (
      <div style={StyleSheet.errorMessage}>
        {error}
        <button
          style={StyleSheet.closeErrorButton}
          onClick={() => setError("")}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div style={StyleSheet.container}>
      <h1 style={StyleSheet.title}>Announcements</h1>

      {/* Create Announcement Form */}
      <div style={StyleSheet.formContainer}>
        <h2 style={StyleSheet.formTitle}>Create Announcement</h2>
        {error && (
          <div style={StyleSheet.errorMessage}>
            {error}
            <button
              style={StyleSheet.closeErrorButton}
              onClick={() => setError("")}
            >
              ✕
            </button>
          </div>
        )}
        <form onSubmit={handleCreateAnnouncement} style={StyleSheet.form}>
          <label style={StyleSheet.label}>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              style={StyleSheet.input}
            />
          </label>
          <label style={StyleSheet.label}>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter announcement description"
              style={StyleSheet.textarea}
            />
          </label>
          <button type="submit" style={StyleSheet.submitButton}>
            Post Announcement
          </button>
        </form>
      </div>

      {/* Past Announcements */}
      <div style={StyleSheet.announcementsContainer}>
        <h2 style={StyleSheet.sectionTitle}>Past Announcements</h2>
        {announcements.length === 0 ? (
          <p style={StyleSheet.text}>No announcements found for this class.</p>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} style={StyleSheet.announcementCard}>
              <h3 style={StyleSheet.announcementTitle}>
                {announcement.title}
              </h3>
              <p style={StyleSheet.announcementDescription}>
                {announcement.description}
              </p>
              <p style={StyleSheet.announcementDate}>
                Announced on: {formatDate(announcement.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
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
  formContainer: {
    marginBottom: "32px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "500",
    marginBottom: "16px",
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
  textarea: {
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
    minHeight: "80px",
    resize: "vertical",
  },
  submitButton: {
    padding: "8px 16px",
    border: "1px solid #000",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    background: "none",
    alignSelf: "flex-start",
  },
  announcementsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "500",
    marginBottom: "16px",
  },
  text: {
    fontSize: "13px",
    textAlign: "center",
  },
  announcementCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
  },
  announcementTitle: {
    fontSize: "16px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  announcementDescription: {
    fontSize: "13px",
    marginBottom: "8px",
  },
  announcementDate: {
    fontSize: "12px",
    fontStyle: "italic",
  },
};

export default TeacherAnnouncement;