import React, { useState } from "react";

const StudentSettings = () => {
  
  const [accountName, setAccountName] = useState("Thilak"); 
  const [tempName, setTempName] = useState(accountName); 
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  
  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };
 
  const handleSaveName = () => {
    setAccountName(tempName);
  };

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme); 
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Settings</h2>

     
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Account Name</h3>
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={tempName}
            onChange={handleNameChange}
            style={styles.input}
            placeholder="Enter your name"
          />
          <button
            onClick={handleSaveName}
            style={styles.saveButton}
            disabled={tempName === accountName || tempName.trim() === ""}
          >
            Save
          </button>
        </div>
        <p style={styles.currentName}>Current name: {accountName}</p>
      </div>

      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Theme</h3>
        <div style={styles.toggleGroup}>
          <span style={styles.label}>Light</span>
          <label style={styles.switch}>
            <input
              type="checkbox"
              checked={isDarkTheme}
              onChange={handleThemeToggle}
            />
            <span style={styles.slider}></span>
          </label>
          <span style={styles.label}>Dark</span>
        </div>
        <p style={styles.currentTheme}>
          Current theme: {isDarkTheme ? "Dark" : "Light"}
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#fff",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
    color: "#202124",
  },
  header: {
    fontSize: "24px",
    fontWeight: "500",
    marginBottom: "20px",
    color: "#202124",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "500",
    marginBottom: "10px",
    color: "#5f6368",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  input: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    flex: 1,
    maxWidth: "300px",
    outline: "none",
    color: "#202124",
  },
  saveButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#fff",
    backgroundColor: "#4285f4",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  currentName: {
    fontSize: "14px",
    color: "#5f6368",
  },
  toggleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  label: {
    fontSize: "14px",
    color: "#202124",
  },
  switch: {
    position: "relative",
    display: "inline-block",
    width: "40px",
    height: "20px",
  },
  slider: {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ccc",
    transition: "0.4s",
    borderRadius: "20px",
  },
  "slider:before": {
    position: "absolute",
    content: '""',
    height: "16px",
    width: "16px",
    left: "2px",
    bottom: "2px",
    backgroundColor: "white",
    transition: "0.4s",
    borderRadius: "50%",
  },
  "input:checked + .slider": {
    backgroundColor: "#4285f4",
  },
  "input:checked + .slider:before": {
    transform: "translateX(20px)",
  },
  "input:focus + .slider": {
    boxShadow: "0 0 1px #4285f4",
  },
  currentTheme: {
    fontSize: "14px",
    color: "#5f6368",
  },
};

export default StudentSettings;