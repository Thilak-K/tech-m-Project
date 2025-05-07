import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const HomeworkSubmission = () => {
  const { homeworkId } = useParams();
  const [formData, setFormData] = useState({
    studentId: localStorage.getItem("userId") || "S001",
    file: null,
    comments: "",
  });
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.file) {
      alert("Please upload a file.");
      return;
    }
    const form = new FormData();
    form.append("studentId", formData.studentId);
    form.append("homeworkId", homeworkId);
    form.append("file", formData.file);
    form.append("comments", formData.comments);

    try {
      await axios.post("http://localhost:8080/submissions", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Submission successful!");
      navigate("/student-dashboard");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <div style={StyleSheet.container}>
      <h1 style={StyleSheet.title}>Submit Homework</h1>
      <div style={StyleSheet.form}>
        <div style={StyleSheet.inputGroup}>
          <label style={StyleSheet.label}>Student ID</label>
          <input
            type="text"
            value={formData.studentId}
            disabled
            style={StyleSheet.input}
          />
        </div>
        <div style={StyleSheet.inputGroup}>
          <label style={StyleSheet.label}>File Upload</label>
          <input
            type="file"
            onChange={handleFileChange}
            style={StyleSheet.input}
          />
        </div>
        <div style={StyleSheet.inputGroup}>
          <label style={StyleSheet.label}>Comments</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            style={StyleSheet.textarea}
            placeholder="Add comments"
          />
        </div>
        <div style={StyleSheet.buttonGroup}>
          <button
            style={StyleSheet.cancelButton}
            onClick={() => navigate("/student-dashboard")}
          >
            Cancel
          </button>
          <button style={StyleSheet.submitButton} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const StyleSheet = {
  container: { padding: "20px", flex: 1 },
  title: { fontSize: "24px", color: "#202124", marginBottom: "20px" },
  form: { maxWidth: "500px" },
  inputGroup: { marginBottom: "20px" },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#5f6368",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    fontSize: "14px",
    minHeight: "100px",
  },
  buttonGroup: { display: "flex", gap: "10px", justifyContent: "flex-end" },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#f1f3f4",
    color: "#5f6368",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#4285f4",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default HomeworkSubmission;
