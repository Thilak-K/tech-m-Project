import React, { useState, useCallback } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const LoginAndSign = () => {
  const [mode, setMode] = useState("signIn");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirectLoading, setIsRedirectLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Backend API Base URL
  const API_BASE_URL = "http://localhost:8080/api/auth";

  // Validation Functions
  const validateEmail = (email) => /^[^@]+@[^@]+\.[^@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  const validateName = (name) => name.trim().length > 0;

  // Input Change Handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", api: "" }));
  }, []);

  // Input Blur Handler (Validation on Blur)
  const handleInputBlur = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "email" && value) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value) ? "" : "Invalid email format",
      }));
    } else if (name === "name" && value) {
      setErrors((prev) => ({
        ...prev,
        name: validateName(value) ? "" : "Name is required",
      }));
    } else if (name === "password" && value) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value)
          ? ""
          : "Password must be at least 8 characters with one letter and one number",
      }));
    }
  }, []);

  // Toggle Password Visibility
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Redirect to Dashboard Based on Role with Loading Delay
  const redirectToDashboard = (role, userId) => {
    setIsRedirectLoading(true);
    setTimeout(() => {
      setIsRedirectLoading(false);
      if (role === "STUDENT") {
        navigate("/student-dashboard", { state: { userId } });
      } else if (role === "TEACHER") {
        navigate("/teacher-dashboard", { state: { userId } });
      }
    }, 1500);
  };

  // Email Login 
  const handleEmailLogin = async () => {
    setIsLoading(true);
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("userRole", data.role);
        redirectToDashboard(data.role, data.userId);
      } else {
        setErrors({ api: data.message || "Invalid credentials. Please check your email and password." });
      }
    } catch (error) {
      setErrors({ api: "An error occurred. Please try again later." });
    }
    setIsLoading(false);
  };

  // Email Sign-Up 
  const handleEmailSignUp = async () => {
    setIsLoading(true);
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password))
      newErrors.password = "Password must be at least 8 characters with one letter and one number";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.role) newErrors.role = "Please select a role";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("userRole", data.role);
        redirectToDashboard(data.role, data.userId);
      } else {
        setErrors({ api: data.message || "Sign-up failed. Email may already exist." });
      }
    } catch (error) {
      setErrors({ api: "An error occurred. Please try again later." });
    }
    setIsLoading(false);
  };

  // Google Login 
  const handleGoogleLogin = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    setGoogleIdToken(idToken);
    try {
      const response = await fetch(`${API_BASE_URL}/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: idToken,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("userRole", data.role);
        redirectToDashboard(data.role, data.userId);
      } else {
        setErrors({ api: data.message || "Google login failed. Please try again." });
      }
    } catch (error) {
      setErrors({ api: "An error occurred during Google login. Please try again." });
    }
  };

  // Google Sign-Up 
  const handleGoogleSignUp = async () => {
    if (!googleIdToken || !formData.role) {
      setErrors({ api: "Please select a role to continue." });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: googleIdToken,
          role: formData.role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("userRole", data.role);
        redirectToDashboard(data.role, data.userId);
        setIsRoleModalOpen(false);
      } else {
        setErrors({ api: data.message || "Google sign-up failed. Please try again." });
      }
    } catch (error) {
      setErrors({ api: "An error occurred during Google sign-up. Please try again." });
    }
    setIsLoading(false);
  };

  // Toggle Between Sign-In and Sign-Up Modes
  const toggleMode = () => {
    setMode(mode === "signIn" ? "signUp" : "signIn");
    setFormData({ email: "", password: "", name: "", role: "" });
    setErrors({});
  };

  return (
    <GoogleOAuthProvider clientId="972539617012-kh3d8l9rnkkqbcdbm4frg2ekqmhaugnt.apps.googleusercontent.com">
      <div style={StyleSheet.pageContainer}>
        {isRedirectLoading ? (
          <div style={StyleSheet.loadingContainer}>
            <div style={StyleSheet.spinner}></div>
            <p style={StyleSheet.loadingText}>Loading...</p>
          </div>
        ) : (
          <div style={StyleSheet.loginCard}>
            <h1 style={StyleSheet.tittle}>Classroom</h1>
            <h2 style={StyleSheet.title}>{mode === "signIn" ? "Sign In" : "Sign Up"}</h2>
            <p style={StyleSheet.subtitle}>Use your email or Google Account to continue</p>

            
            <div style={StyleSheet.formContainer}>
              <div style={StyleSheet.inputGroup}>
                <label style={StyleSheet.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  style={{
                    ...StyleSheet.input,
                    borderColor: errors.email ? "#ef5350" : formData.email && validateEmail(formData.email) ? "#4caf50" : "#e0e0e0",
                  }}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && <span style={StyleSheet.error}>{errors.email}</span>}
              </div>
              <div style={StyleSheet.inputGroup}>
                <label style={StyleSheet.label}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    style={{
                      ...StyleSheet.input,
                      borderColor: errors.password ? "#ef5350" : formData.password && validatePassword(formData.password) ? "#4caf50" : "#e0e0e0",
                    }}
                    placeholder="Enter your password"
                    required
                  />
                  <span
                    onClick={toggleShowPassword}
                    style={StyleSheet.eyeIcon}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
                {errors.password && <span style={StyleSheet.error}>{errors.password}</span>}
              </div>
              {mode === "signUp" && (
                <>
                  <div style={StyleSheet.inputGroup}>
                    <label style={StyleSheet.label}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      style={{
                        ...StyleSheet.input,
                        borderColor: errors.name ? "#ef5350" : formData.name && validateName(formData.name) ? "#4caf50" : "#e0e0e0",
                      }}
                      placeholder="Enter your name"
                      required
                    />
                    {errors.name && <span style={StyleSheet.error}>{errors.name}</span>}
                  </div>
                  <div style={StyleSheet.inputGroup}>
                    <label style={StyleSheet.label}>Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      style={{
                        ...StyleSheet.input,
                        borderColor: errors.role ? "#ef5350" : formData.role ? "#4caf50" : "#e0e0e0",
                      }}
                      required
                    >
                      <option value="">Select role</option>
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                    </select>
                    {errors.role && <span style={StyleSheet.error}>{errors.role}</span>}
                  </div>
                </>
              )}
              <button
                style={StyleSheet.emailSignInButton}
                onClick={mode === "signIn" ? handleEmailLogin : handleEmailSignUp}
                disabled={
                  mode === "signIn"
                    ? !formData.email || !formData.password
                    : !formData.email || !formData.password || !formData.name || !formData.role
                }
              >
                {isLoading ? "Loading..." : mode === "signIn" ? "Sign In" : "Sign Up"}
              </button>
              {errors.api && <span style={StyleSheet.error}>{errors.api}</span>}
            </div>

            {/* Separator */}
            <div style={StyleSheet.separator}>
              <span style={StyleSheet.separatorText}>OR</span>
            </div>

            {/* Google Login/Sign-Up */}
            <div style={StyleSheet.googleButtonWrapper}>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (mode === "signIn") {
                    handleGoogleLogin(credentialResponse);
                  } else {
                    setGoogleIdToken(credentialResponse.credential);
                    setIsRoleModalOpen(true);
                  }
                }}
                onError={() => setErrors({ api: "Google login failed. Please try again." })}
                render={(renderProps) => (
                  <button
                    style={StyleSheet.googleButton}
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled || isLoading}
                  >
                    <FcGoogle style={StyleSheet.googleIcon} />
                    <span style={StyleSheet.buttonText}>
                      {mode === "signIn" ? "Sign in with Google" : "Sign up with Google"}
                    </span>
                  </button>
                )}
              />
            </div>

            {/* Toggle Link */}
            <div style={StyleSheet.toggleContainer}>
              <span style={StyleSheet.toggleLink} onClick={toggleMode}>
                {mode === "signIn" ? "New user? Sign Up" : "Already have an account? Sign In"}
              </span>
            </div>
          </div>
        )}

        {/* Role Selection Modal for Google Sign-Up */}
        {isRoleModalOpen && !isRedirectLoading && (
          <div style={StyleSheet.modalOverlay}>
            <div style={StyleSheet.modal}>
              <h2 style={StyleSheet.modalTitle}>Complete Your Sign-Up</h2>
              <div style={StyleSheet.inputGroup}>
                <label style={StyleSheet.label}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    ...StyleSheet.input,
                    borderColor: errors.role ? "#ef5350" : formData.role ? "#4caf50" : "#e0e0e0",
                  }}
                  required
                >
                  <option value="">Select role</option>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
                {errors.role && <span style={StyleSheet.error}>{errors.role}</span>}
              </div>
              <div style={StyleSheet.modalActions}>
                <button
                  style={StyleSheet.cancelButton}
                  onClick={() => {
                    setIsRoleModalOpen(false);
                    setGoogleIdToken(null);
                    setFormData({ ...formData, role: "" });
                  }}
                >
                  Cancel
                </button>
                <button
                  style={StyleSheet.submitButton}
                  onClick={handleGoogleSignUp}
                  disabled={!formData.role || isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};
const StyleSheet = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #f0f4ff 0%, #e6efff 100%)", 
    fontFamily: "'Inter', sans-serif", 
  },
  loginCard: {
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
    "&:focus": {
      borderColor: "#3b82f6", 
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
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
  emailSignInButton: {
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
  separator: {
    position: "relative",
    margin: "1.5rem 0",
    textAlign: "center",
    "&:before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: 0,
      right: 0,
      borderTop: "3px solid #000000",
    },
  },
  separatorText: {
    backgroundColor: "#ffffff",
    padding: "0 12px",
    fontSize: "0.9rem",
    color: "#000",
    position: "relative",
    zIndex: 1,
  },
  googleButtonWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "12px 30px",
    backgroundColor: "#ffffff",
    border: "1px solidrgb(255, 250, 250)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.1s, box-shadow 0.2s",
    "&:hover": {
      backgroundColor: "#f8fafc",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
  googleIcon: {
    fontSize: "1.5rem",
  },
  buttonText: {
    fontSize: "1.5rem",
    fontWeight: "500",
    color: "#1a1a1a",
  },
  toggleContainer: {
    textAlign: "center",
  },
  toggleLink: {
    fontSize: "0.9rem",
    color: "#3b82f6",
    cursor: "pointer",
  
    transition: "color 0.2s",
    "&:hover": {
      color: "#2563eb",
      textDecoration: "underline",
    },
  },
  error: {
    fontSize: "0.85rem",
    color: "#ef5350",
    marginTop: "0.5rem",
    display: "block",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 40,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    width: "320px",
    padding: "1.5rem",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
    transform: "scale(0.95)",
    transition: "transform 0.2s ease-in-out",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "1.5rem",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "1.5rem",
  },
  cancelButton: {
    padding: "10px 20px",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#666",
    backgroundColor: "#f1f3f4",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#e5e7eb",
    },
  },
  submitButton: {
    padding: "10px 20px",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#fff",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s, transform 0.1s",
    "&:hover": {
      backgroundColor: "#2563eb",
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "1.1rem",
    color: "#1a1a1a",
    fontWeight: "500",
  },
};

// Add keyframe animation for spinner
const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default LoginAndSign;