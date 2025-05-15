import React, { useState, useEffect } from "react";

const StudentSettings = ({ userId }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [tempName, setTempName] = useState("");
  const [tempSection, setTempSection] = useState("");
  const [tempRollNumber, setTempRollNumber] = useState("");
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [isSectionEditing, setIsSectionEditing] = useState(false);
  const [isRollNumberEditing, setIsRollNumberEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [rollNumberError, setRollNumberError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isButtonHovered, setIsButtonHovered] = useState({ save: false, cancel: false });

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setMessage("User ID not found. Please log in again.");
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`http://localhost:8080/api/auth/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (response.ok) {
          setUserDetails(data);
          setTempName(data.name || "");
          setTempSection(data.section || "");
          setTempRollNumber(data.rollNumber ? data.rollNumber.toString() : "");
          setMessage("");
        } else {
          setMessage(data.message || "Failed to fetch user details.");
        }
      } catch (err) {
        setMessage(
          err.name === "AbortError"
            ? "Request timed out. Please check your connection and try again."
            : `An error occurred: ${err.message}`
        );
        console.error("Fetch error:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleSaveChanges = async () => {
    if (!userDetails) return;

    if (!tempName.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }

    if (tempSection && !/^[A-Z]{1,5}(-[A-Z0-9]{1,5})?$/.test(tempSection)) {
      setMessage("Section must be in the format like 'ECE-A' or 'CSE'.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setRollNumberError(""); 

    try {
      const response = await fetch(`http://localhost:8080/api/auth/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tempName,
          section: tempSection || null,
          rollNumber: tempRollNumber ? parseInt(tempRollNumber) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserDetails({
          ...userDetails,
          name: tempName,
          section: tempSection,
          rollNumber: tempRollNumber ? parseInt(tempRollNumber) : null,
        });
        setMessage("Changes saved successfully!");
        setIsNameEditing(false);
        setIsSectionEditing(false);
        setIsRollNumberEditing(false);
      } else {
        setMessage(data.message || "Failed to save changes.");
      }
    } catch (err) {
      setMessage(`An error occurred while saving changes: ${err.message}`);
      console.error("Save error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempName(userDetails.name || "");
    setTempSection(userDetails.section || "");
    setTempRollNumber(userDetails.rollNumber ? userDetails.rollNumber.toString() : "");
    setIsNameEditing(false);
    setIsSectionEditing(false);
    setIsRollNumberEditing(false);
    setMessage("");
    setRollNumberError("");
  };

  const handleRollNumberChange = (e) => {
  const value = e.target.value;
  if (/^[a-zA-Z0-9]*$/.test(value)) {
    setTempRollNumber(value);
    setRollNumberError("");
  } else {
    setRollNumberError("Only alphanumeric characters are allowed for Roll Number.");
  }
};

  const hasChanges =
    userDetails &&
    (tempName !== userDetails.name ||
      tempSection !== (userDetails.section || "") ||
      tempRollNumber !== (userDetails.rollNumber ? userDetails.rollNumber.toString() : ""));

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Settings</h2>

      {isFetching ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loading}>Loading user details...</p>
        </div>
      ) : userDetails ? (
        <div style={styles.settingsWrapper}>
          <div style={styles.infoSection}>
            <h3 style={styles.sectionHeader}>Account Information</h3>
            <div style={styles.infoField}>
              <span style={styles.label}>User ID:</span>
              <span style={styles.value}>{userDetails.id || "N/A"}</span>
            </div>
            <div style={styles.infoField}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{userDetails.email || "N/A"}</span>
            </div>
            <div style={styles.infoField}>
              <span style={styles.label}>Account Type:</span>
              <span style={styles.value}>Student</span>
            </div>
            <div style={styles.infoField}>
              <span style={styles.label}>Last Updated:</span>
              <span style={styles.value}>
                {new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}
              </span>
            </div>
          </div>

          <div style={styles.editSection}>
            <h3 style={styles.sectionHeader}>Edit Profile</h3>

            <div style={styles.field}>
              <div style={styles.fieldHeader}>
                <span style={styles.label}>Name</span>
                <button
                  style={styles.editButton}
                  onClick={() => setIsNameEditing(!isNameEditing)}
                >
                  {isNameEditing ? "Cancel Edit" : "Edit"}
                </button>
              </div>
              {isNameEditing ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  style={styles.input}
                  placeholder="Enter your name"
                />
              ) : (
                <span style={styles.value}>{tempName || "N/A"}</span>
              )}
            </div>

            <div style={styles.field}>
              <div style={styles.fieldHeader}>
                <span style={styles.label}>Section</span>
                <button
                  style={styles.editButton}
                  onClick={() => setIsSectionEditing(!isSectionEditing)}
                >
                  {isSectionEditing ? "Cancel Edit" : "Edit"}
                </button>
              </div>
              {isSectionEditing ? (
                <input
                  type="text"
                  value={tempSection}
                  onChange={(e) => setTempSection(e.target.value.toUpperCase())}
                  style={styles.input}
                  placeholder="e.g., ECE-A"
                />
              ) : (
                <span style={styles.value}>{tempSection || "Not set"}</span>
              )}
            </div>

            <div style={styles.field}>
              <div style={styles.fieldHeader}>
                <span style={styles.label}>Roll Number</span>
                <button
                  style={styles.editButton}
                  onClick={() => setIsRollNumberEditing(!isRollNumberEditing)}
                >
                  {isRollNumberEditing ? "Cancel Edit" : "Edit"}
                </button>
              </div>
              {isRollNumberEditing ? (
                <>
                  <input
                    type="text" 
                    value={tempRollNumber}
                    onChange={handleRollNumberChange}
                    style={styles.input}
                    placeholder="e.g., 123"
                  />
                  {rollNumberError && (
                    <p style={styles.inputError}>{rollNumberError}</p>
                  )}
                </>
              ) : (
                <span style={styles.value}>{tempRollNumber || "Not set"}</span>
              )}
            </div>

            <div style={styles.buttonContainer}>
              {hasChanges && (
                <button
                  style={{
                    ...styles.cancelButton,
                    ...(isButtonHovered.cancel ? { backgroundColor: "#c0392b" } : {}),
                  }}
                  onClick={handleCancel}
                  onMouseEnter={() => setIsButtonHovered({ ...isButtonHovered, cancel: true })}
                  onMouseLeave={() => setIsButtonHovered({ ...isButtonHovered, cancel: false })}
                >
                  Cancel
                </button>
              )}
              <button
                style={{
                  ...styles.saveButton,
                  ...(isLoading || !hasChanges || tempName.trim() === ""
                    ? styles.saveButtonDisabled
                    : isButtonHovered.save
                    ? { backgroundColor: "#27ae60" }
                    : {}),
                }}
                disabled={isLoading || !hasChanges || tempName.trim() === ""}
                onClick={handleSaveChanges}
                onMouseEnter={() => setIsButtonHovered({ ...isButtonHovered, save: true })}
                onMouseLeave={() => setIsButtonHovered({ ...isButtonHovered, save: false })}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {message && (
              <p
                style={{
                  ...styles.message,
                  color: message.includes("successfully") ? "#2ecc71" : "#e74c3c",
                }}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p style={styles.error}>{message || "Failed to load user details."}</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "40px 20px",
    backgroundColor: "#f5f6fa",
    boxSizing: "border-box",
    color: "#2c3e50",
    fontFamily: "'Roboto', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    fontSize: "32px",
    fontWeight: "600",
    marginBottom: "40px",
    color: "#2c3e50",
    textAlign: "center",
    letterSpacing: "1px",
  },
  settingsWrapper: {
    width: "100%",
    maxWidth: "1200px",
    display: "flex",
    flexDirection: "row",
    gap: "40px",
    flexWrap: "wrap",
  },
  infoSection: {
    flex: "1",
    minWidth: "300px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
    padding: "30px",
    borderLeft: "4px solid #3498db",
    transition: "transform 0.2s ease",
  },
  editSection: {
    flex: "1",
    minWidth: "300px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
    padding: "30px",
    borderLeft: "4px solid #1abc9c",
    transition: "transform 0.2s ease",
  },
  sectionHeader: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "25px",
    borderBottom: "2px solid #e0e0e0",
    paddingBottom: "10px",
    letterSpacing: "0.5px",
  },
  infoField: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "10px 0",
    borderBottom: "1px solid #f1f3f4",
  },
  field: {
    marginBottom: "25px",
  },
  fieldHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  label: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#34495e",
  },
  value: {
    fontSize: "16px",
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #dfe6e9",
    borderRadius: "8px",
    outline: "none",
    color: "#2c3e50",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  inputError: {
    marginTop: "5px",
    fontSize: "12px",
    color: "#e74c3c",
    fontStyle: "italic",
  },
  editButton: {
    padding: "6px 14px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#3498db",
    backgroundColor: "transparent",
    border: "1px solid #3498db",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    marginTop: "30px",
  },
  saveButton: {
    padding: "12px 30px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#2ecc71",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    boxShadow: "0 2px 8px rgba(46, 204, 113, 0.3)",
  },
  saveButtonDisabled: {
    backgroundColor: "#bdc3c7",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  cancelButton: {
    padding: "12px 30px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#e74c3c",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    boxShadow: "0 2px 8px rgba(231, 76, 60, 0.3)",
  },
  message: {
    marginTop: "20px",
    fontSize: "14px",
    textAlign: "center",
    fontWeight: "500",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  loading: {
    fontSize: "18px",
    color: "#7f8c8d",
    textAlign: "center",
    fontStyle: "italic",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  error: {
    fontSize: "18px",
    color: "#e74c3c",
    textAlign: "center",
    fontWeight: "500",
  },
};

// Keyframes for spinner animation
const styleElement = document.createElement("style");
styleElement.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleElement);

export default StudentSettings;