import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract token from URL query parameter
  const token = new URLSearchParams(location.search).get("token");

  // Validate password
  const validatePassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "newPassword") {
      setNewPassword(value);
      setErrors((prev) => ({
        ...prev,
        newPassword: validatePassword(value)
          ? ""
          : "Password must be at least 8 characters with one letter and one number",
      }));
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value === newPassword ? "" : "Passwords do not match",
      }));
    }
    setMessage("");
  };

  // Toggle password visibility
  const toggleShowPassword = (field) => {
    if (field === "newPassword") {
      setShowPassword((prev) => !prev);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = {};
    if (!newPassword) newErrors.newPassword = "New password is required";
    else if (!validatePassword(newPassword))
      newErrors.newPassword =
        "Password must be at least 8 characters with one letter and one number";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Password reset successful!");
        setTimeout(() => navigate("/login"), 2000); // Redirect to login after 2 seconds
      } else {
        setMessage(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setMessage("An error occurred. Please try again later.");
    }
    setIsLoading(false);
  };

  // Check if token is present
  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing token. Please use a valid reset link.");
    }
  }, [token]);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.resetCard}>
        <h1 style={styles.tittle}>Classroom</h1>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>Enter your new password below</p>

        <form onSubmit={handleSubmit} style={styles.formContainer}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={newPassword}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.newPassword ? "#ef5350" : newPassword && validatePassword(newPassword) ? "#4caf50" : "#e0e0e0",
                }}
                placeholder="Enter new password"
              />
              <span
                onClick={() => toggleShowPassword("newPassword")}
                style={styles.eyeIcon}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            {errors.newPassword && <span style={styles.error}>{errors.newPassword}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.confirmPassword ? "#ef5350" : confirmPassword && confirmPassword === newPassword ? "#4caf50" : "#e0e0e0",
                }}
                placeholder="Confirm new password"
              />
              <span
                onClick={() => toggleShowPassword("confirmPassword")}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={isLoading || !token || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          {message && (
            <span
              style={{
                ...styles.error,
                color: message.includes("successful") ? "#4caf50" : "#ef5350",
              }}
            >
              {message}
            </span>
          )}
        </form>
      </div>
    </div>
  );
};

// Reuse styles from LoginAndSign.js for consistency
const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #f0f4ff 0%, #e6efff 100%)",
    fontFamily: "'Inter', sans-serif",
  },
  resetCard: {
    backgroundColor: "#ffffff",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    transition: "transform 0.2s ease-in-out",
  },
  tittle: {
    fontSize: "2rem",
    color: "#2e7d32",
    fontWeight: "600",
    marginBottom: "0.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "0.75rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "2rem",
  },
  formContainer: {
    marginBottom: "1.5rem",
  },
  inputGroup: {
    marginBottom: "1.5rem",
    textAlign: "left",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#000",
    marginBottom: "0.5rem",
    display: "block",
  },
  input: {
    width: "91%",
    padding: "12px",
    fontSize: "1rem",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    outline: "none",
    color: "#1a1a1a",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeIcon: {
    position: "absolute",
    right: "25px",
    top: "55%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#666",
    fontSize: "1.2rem",
  },
  submitButton: {
    width: "97%",
    padding: "12px",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "500",
    color: "#ffffff",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.1s",
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
    "&:disabled": {
      backgroundColor: "#93c5fd",
      cursor: "not-allowed",
    },
  },
  error: {
    fontSize: "0.85rem",
    marginTop: "0.5rem",
    display: "block",
  },
};

export default ResetPassword;