import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const TeacherSettings = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [tempName, setTempName] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const location = useLocation();
  const userId = location.state?.userId;

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setMessage("User ID not found");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/auth/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserDetails(data);
          setTempName(data.name || "");
          setTempPassword(data.password || "");
        } else {
          setMessage(data.message || "Failed to fetch user details.");
        }
      } catch (err) {
        setMessage("An error occurred while fetching user details.");
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleSaveChanges = async () => {
    if (!userDetails) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`http://localhost:8080/api/auth/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tempName,
          password: tempPassword || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUserDetails({ ...userDetails, name: tempName, password: tempPassword });
        setMessage("Changes saved successfully!");
      } else {
        setMessage(data.message || "Failed to save changes.");
      }
    } catch (err) {
      setMessage("An error occurred while saving changes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Settings</h2>

      {userDetails ? (
        <div style={styles.card}>
          <h3 style={styles.cardHeader}>Profile Details</h3>

          {/* User ID */}
          <div style={styles.field}>
            <label style={styles.label}>User ID</label>
            <input
              type="text"
              value={userDetails.id || ""}
              style={styles.inputDisabled}
              readOnly
              disabled
            />
          </div>

          <hr style={styles.divider} />

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="text"
              value={userDetails.email || ""}
              style={styles.inputDisabled}
              readOnly
              disabled
            />
          </div>

          <hr style={styles.divider} />

          {/* Name */}
          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              style={styles.input}
              placeholder="Enter your name"
            />
          </div>

          <hr style={styles.divider} />

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            {userDetails.password ? (
              <input
                type="password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter new password"
              />
            ) : (
              <input
                type="text"
                value="Google User"
                style={styles.inputDisabled}
                readOnly
                disabled
              />
            )}
          </div>

          <button
            style={{
              ...styles.saveButton,
              ...(isLoading ||
              (tempName === userDetails.name && tempPassword === userDetails.password) ||
              tempName.trim() === ""
                ? styles.saveButton[":disabled"]
                : (isButtonHovered ? { backgroundColor: "#3267d6" } : {})),
            }}
            disabled={
              isLoading ||
              (tempName === userDetails.name && tempPassword === userDetails.password) ||
              tempName.trim() === ""
            }
            onClick={handleSaveChanges}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>

          {message && (
            <p
              style={{
                ...styles.message,
                color: message.includes("successfully") ? "#34a853" : "#d93025",
              }}
            >
              {message}
            </p>
          )}
        </div>
      ) : (
        <p style={styles.loading}>Loading user details...</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    boxSizing: "border-box",
    color: "#202124",
    fontFamily: "'Roboto', sans-serif",
  },
  header: {
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "24px",
    color: "#202124",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    maxWidth: "450px",
    margin: "0 auto",
  },
  cardHeader: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#202124",
    marginBottom: "20px",
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: "8px",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#5f6368",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    outline: "none",
    color: "#202124",
    boxSizing: "border-box",
  },
  inputDisabled: {
    width: "100%",
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    outline: "none",
    color: "#5f6368",
    boxSizing: "border-box",
    backgroundColor: "#f1f3f4",
    cursor: "not-allowed",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #e0e0e0",
    margin: "12px 0",
  },
  saveButton: {
    display: "block",
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#fff",
    backgroundColor: "#4285f4",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":disabled": {
      backgroundColor: "#cccccc",
      cursor: "not-allowed",
    },
  },
  message: {
    marginTop: "16px",
    fontSize: "13px",
    textAlign: "center",
  },
  loading: {
    fontSize: "16px",
    color: "#5f6368",
    textAlign: "center",
  },
};

export default TeacherSettings;