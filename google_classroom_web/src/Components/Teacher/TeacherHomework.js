import React, { useState } from "react";

const TeacherHomework = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handlePost = () => {
    if (title && description) {
      const newHomework = {
        id: Date.now(),
        title,
        description,
        postedAt: new Date().toLocaleString(),
      };
      setHomeworks([newHomework, ...homeworks]);
      setTitle("");
      setDescription("");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Homework</h2>

      <div style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="Homework Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          style={styles.textarea}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button style={styles.postButton} onClick={handlePost}>
          Post Homework
        </button>
      </div>

      <div style={styles.list}>
        {homeworks.map((hw) => (
          <div key={hw.id} style={styles.card}>
            <h3>{hw.title}</h3>
            <p>{hw.description}</p>
            <span style={styles.timestamp}>Posted on: {hw.postedAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    maxWidth: "800px",
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
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minHeight: "80px",
  },
  postButton: {
    padding: "10px 15px",
    backgroundColor: "#4A90E2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  card: {
    padding: "15px",
    backgroundColor: "#f8f8f8",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  timestamp: {
    fontSize: "12px",
    color: "#888",
    marginTop: "8px",
    display: "block",
  },
};

export default TeacherHomework;
