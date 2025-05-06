import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc"; // For the Google icon in the button

const LoginAndSign = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEmailLogin = () => {
    // Placeholder for email/password login functionality
    if (formData.email.trim() && formData.password.trim()) {
      console.log("Email Login:", formData.email, formData.password);
      // In a real app, you'd handle email/password authentication here (e.g., API call)
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google login functionality
    console.log("Sign in with Google clicked");
    // In a real app, you'd integrate Google OAuth here (e.g., using Firebase or Google's API)
  };

  return (
    <div style={StyleSheet.pageContainer}>
      <div style={StyleSheet.loginCard}>
        <h1 style={StyleSheet.tittle}>Classroom</h1>
        <h2 style={StyleSheet.title}>Sign in </h2>
        <p style={StyleSheet.subtitle}>Use your email or Google Account</p>

        {/* Email and Password Login */}
        <div style={StyleSheet.formContainer}>
          <div style={StyleSheet.inputGroup}>
            <label style={StyleSheet.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={StyleSheet.input}
              placeholder="Enter your email"
              required
            />
          </div>
          <div style={StyleSheet.inputGroup}>
            <label style={StyleSheet.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              style={StyleSheet.input}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            style={StyleSheet.emailSignInButton}
            onClick={handleEmailLogin}
            disabled={!formData.email.trim() || !formData.password.trim()}
          >
            Sign In
          </button>
        </div>

        {/* Separator */}
        <div style={StyleSheet.separator}>
          <span style={StyleSheet.separatorText}>OR</span>
        </div>

        {/* Google Login */}
        <button style={StyleSheet.googleButton} onClick={handleGoogleLogin}>
          <FcGoogle style={StyleSheet.googleIcon} />
          <span style={StyleSheet.buttonText}>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

const StyleSheet = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #e0e7ff 0%, #f5f5f5 100%)", // Subtle gradient from light grayish-blue to light gray
  },
  loginCard: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: "380px",
    textAlign: "center",
  },
  googleLogo: {
    width: "92px",
    height: "30px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "400",
    color: "#202124",
    marginBottom: "10px",
  },
  tittle: {
    fontSize: "28px",
    color: "green",
    fontWeight: "400",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#5f6368",
    marginBottom: "30px",
  },
  formContainer: {
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "20px",
    textAlign: "left",
  },
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
    fontSize: "14px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    outline: "none",
    color: "#202124",
    "&:focus": {
      borderColor: "#4285f4",
      boxShadow: "0 0 0 1px #4285f4",
    },
  },
  emailSignInButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#4285f4",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#ffffff",
    cursor: "pointer",
    transition: "background-color 0.2s, box-shadow 0.2s",
    "&:hover": {
      backgroundColor: "#3267d6",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    },
    "&:disabled": {
      backgroundColor: "#a0c3ff",
      cursor: "not-allowed",
    },
  },
  separator: {
    position: "relative",
    margin: "20px 0",
    textAlign: "center",
    "&:before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: 0,
      right: 0,
      borderTop: "1px solid #dadce0",
    },
  },
  separatorText: {
    backgroundColor: "#ffffff",
    padding: "0 10px",
    fontSize: "14px",
    color: "#5f6368",
    position: "relative",
    zIndex: 1,
  },
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "10px",
    backgroundColor: "#4285f4",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s, box-shadow 0.2s",
    "&:hover": {
      backgroundColor: "#3267d6",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    },
  },
  googleIcon: {
    fontSize: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "2px",
    padding: "2px",
  },
  buttonText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#ffffff",
  },
};

export default LoginAndSign;