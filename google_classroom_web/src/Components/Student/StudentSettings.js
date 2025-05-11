import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentSettings = ({ userId }) => {
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    section: "",
    rollNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch profile data using userId when the component mounts
  useEffect(() => {
    if (!userId) {
      setError("User ID is missing. Unable to fetch profile.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/auth/users/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });

        const data = response.data;
        setProfile({
          id: data.id || userId,
          name: data.name || "",
          email: data.email || "",
          section: data.section || "",
          rollNumber: data.rollNumber ? data.rollNumber.toString() : "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError("Failed to fetch profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "section") {
      // Convert section to uppercase
      setProfile({ ...profile, [name]: value.toUpperCase() });
    } else if (name === "rollNumber") {
      // Allow only numeric values for rollNumber
      if (/^\d*$/.test(value)) {
        setProfile({ ...profile, [name]: value });
      }
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/auth/users/${userId}`,
        {
          name: profile.name,
          section: profile.section,
          rollNumber: profile.rollNumber ? parseInt(profile.rollNumber) : null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      alert("Profile updated successfully!");
      setIsEditing(false);
      setError("");
    } catch (error) {
      console.error("Profile update failed:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={StyleSheet.container}>
      <h1 style={StyleSheet.title}>Profile Settings</h1>
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
      <div style={StyleSheet.form}>
        <div style={StyleSheet.inputGroup}>
          <label style={StyleSheet.label}>User ID</label>
          <input
            type="text"
            name="id"
            value={profile.id}
            style={StyleSheet.input}
            disabled
          />
        </div>
        <div style={StyleSheet.inputGroup}>
          <label style={StyleSheet.label}>Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            style={StyleSheet.input}
            disabled
          />
        </div>
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
          <label style={StyleSheet.label}>Section (e.g., ECE-A)</label>
          <input
            type="text"
            name="section"
            value={profile.section}
            onChange={handleInputChange}
            style={StyleSheet.input}
            disabled={!isEditing}
            placeholder="e.g., ECE-A"
          />
        </div>
        <div style={StyleSheet.inputGroup}>
          <label style={StyleSheet.label}>Roll Number </label>
          <input
            type="text"
            name="rollNumber"
            value={profile.rollNumber}
            onChange={handleInputChange}
            style={StyleSheet.input}
            disabled={!isEditing}
            placeholder="e.g., 123"
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
    padding: "40px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "32px",
    textAlign: "center",
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)",
    padding: "32px",
    width: "100%",
    maxWidth: "500px",
  },
  inputGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    color: "#2d3748",
    backgroundColor: "#ffffff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    ":focus": {
      borderColor: "#3182ce",
      boxShadow: "0 0 0 3px rgba(49, 130, 206, 0.1)",
    },
  },
  inputDisabled: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    color: "#718096",
    backgroundColor: "#edf2f7",
    cursor: "not-allowed",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    gap: "16px",
    marginTop: "24px",
  },
  editButton: {
    display: "block",
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#3182ce",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s, transform 0.1s",
    ":hover": {
      backgroundColor: "#2b6cb0",
      transform: "translateY(-1px)",
    },
    ":active": {
      transform: "translateY(0)",
    },
  },
  saveButton: {
    flex: 1,
    padding: "12px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#3182ce",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s, transform 0.1s",
    ":hover": {
      backgroundColor: "#2b6cb0",
      transform: "translateY(-1px)",
    },
    ":active": {
      transform: "translateY(0)",
    },
  },
  cancelButton: {
    flex: 1,
    padding: "12px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#4a5568",
    backgroundColor: "#edf2f7",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s, transform 0.1s",
    ":hover": {
      backgroundColor: "#e2e8f0",
      transform: "translateY(-1px)",
    },
    ":active": {
      transform: "translateY(0)",
    },
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fed7d7",
    color: "#9b2c2c",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontSize: "14px",
    width: "100%",
    maxWidth: "500px",
  },
  closeErrorButton: {
    background: "none",
    border: "none",
    color: "#9b2c2c",
    fontSize: "16px",
    cursor: "pointer",
    padding: "0 8px",
  },
};

export default StudentSettings;