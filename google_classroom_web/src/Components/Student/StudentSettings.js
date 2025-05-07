import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentSettings = () => {
  const [profile, setProfile] = useState({
    name: "",
    class: "",
    studentId: "",
  });
  const [isEditing, setIsEditing] = useState(false);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:8080/users/S001`, profile);
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div style={StyleSheet.container}>
      <h1 style={StyleSheet.title}>Profile Settings</h1>
      <div style={StyleSheet.form}>
        <div style={StyleSheet.inputGroup}>
          <label style={StyleSheet.label}>Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleInputChange}
            style={StyleSheet.input}
            disabled={!isEditing}
          />
        </div>
        <div style={StyleSheet.inputGroup}>
          <label style={StyleSheet.label}>Class</label>
          <input
            type="text"
            name="class"
            value={profile.class}
            onChange={handleInputChange}
            style={StyleSheet.input}
            disabled={!isEditing}
          />
        </div>
        <div style={StyleSheet.inputGroup}>
          <label style={StyleSheet.label}>Student ID</label>
          <input
            type="text"
            name="studentId"
            value={profile.studentId}
            style={StyleSheet.input}
            disabled
          />
        </div>
        {isEditing ? (
          <div style={StyleSheet.buttonGroup}>
            <button
              style={StyleSheet.cancelButton}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button style={StyleSheet.saveButton} onClick={handleSave}>
              Save
            </button>
          </div>
        ) : (
          <button
            style={StyleSheet.editButton}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

const StyleSheet = {
  container: {
    padding: "20px",
    flex: 1,
  },
  title: {
    fontSize: "24px",
    color: "#202124",
    marginBottom: "20px",
  },
  form: { maxWidth: "400px" },
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
  buttonGroup: { display: "flex", gap: "10px" },
  editButton: {
    padding: "10px 20px",
    backgroundColor: "#4285f4",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#f1f3f4",
    color: "#5f6368",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#4285f4",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default StudentSettings;
