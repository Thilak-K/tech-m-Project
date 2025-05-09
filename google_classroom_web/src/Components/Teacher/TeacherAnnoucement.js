import React, { useState } from "react";

const TeacherAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [announcementText, setAnnouncementText] = useState("");

  const handlePost = () => {
    if (announcementText.trim()) {
      setAnnouncements([
        {
          id: Date.now(),
          message: announcementText,
          time: new Date().toLocaleString(),
        },
        ...announcements,
      ]);
      setAnnouncementText("");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Class Announcements</h2>
      <div style={styles.form}>
        <textarea
          style={styles.textarea}
          placeholder="Write your announcement..."
          value={announcementText}
          onChange={(e) => setAnnouncementText(e.target.value)}
        />
        <button style={styles.postButton} onClick={handlePost}>
          Post Announcement
        </button>
      </div>
      <div style={styles.announcementList}>
        {announcements.map((a) => (
          <div key={a.id} style={styles.card}>
            <p>{a.message}</p>
            <span style={styles.timestamp}>Posted on: {a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    maxWidth: "700px",
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "30px",
  },
  textarea: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    minHeight: "80px",
  },
  postButton: {
    padding: "10px",
    backgroundColor: "#C8405A",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  announcementList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: "16px",
    borderRadius: "8px",
    borderLeft: "5px solid #C8405A",
  },
  timestamp: {
    fontSize: "12px",
    color: "#666",
    marginTop: "8px",
    display: "block",
  },
};

export default TeacherAnnouncement;
