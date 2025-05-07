import React, { useState, useCallback } from "react";
import { FcGoogle } from "react-icons/fc";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Configure axios to include the JWT token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const LoginAndSign = () => {
  const [mode, setMode] = useState("signIn"); // "signIn" or "signUp"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  const navigate = useNavigate();

  // Validation Functions
  const validateEmail = (email) => /^[^@]+@[^@]+\.[^@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password); // At least 8 characters, one letter, one number
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

  // Email Login Handler
  const handleEmailLogin = async () => {
    setIsLoading(true);
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password))
      newErrors.password =
        "Password must be at least 8 characters with one letter and one number";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      const { token, user } = response.data;
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userRole", user.role);
      redirectToDashboard(user.role);
    } catch (error) {
      console.error("Email login failed:", error.response?.data || error.message);
      setErrors({ api: "Invalid credentials. Please check your email and password." });
    } finally {
      setIsLoading(false);
    }
  };

  // Email Sign-Up Handler
  const handleEmailSignUp = async () => {
    setIsLoading(true);
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password))
      newErrors.password =
        "Password must be at least 8 characters with one letter and one number";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.role) newErrors.role = "Please select a role";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      });
      const { token, user } = response.data;
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userRole", user.role);
      redirectToDashboard(user.role);
    } catch (error) {
      console.error("Sign-up failed:", error.response?.data || error.message);
      setErrors({ api: "Sign-up failed. Email may already exist." });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/auth/google-login", {
        idToken: credentialResponse.credential,
      });
      const { token, user, isNewUser } = response.data;
      if (isNewUser) {
        setGoogleIdToken(credentialResponse.credential);
        setIsRoleModalOpen(true);
      } else {
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("userRole", user.role);
        redirectToDashboard(user.role);
      }
    } catch (error) {
      console.error("Google login failed:", error.response?.data || error.message);
      setErrors({ api: "Google login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-Up Handler
  const handleGoogleSignUp = async () => {
    if (!formData.role) {
      setErrors({ role: "Please select a role" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", {
        idToken: googleIdToken,
        role: formData.role,
      });
      const { token, user } = response.data;
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userRole", user.role);
      setIsRoleModalOpen(false);
      setGoogleIdToken(null);
      redirectToDashboard(user.role);
    } catch (error) {
      console.error("Google sign-up failed:", error.response?.data || error.message);
      setErrors({ api: "Google sign-up failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to Dashboard Based on Role
  const redirectToDashboard = (role) => {
    if (role === "STUDENT") {
      navigate("/student-dashboard");
    } else if (role === "TEACHER") {
      navigate("/teacher-dashboard");
    }
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
        <div style={StyleSheet.loginCard}>
          <h1 style={StyleSheet.tittle}>Classroom</h1>
          <h2 style={StyleSheet.title}>{mode === "signIn" ? "Sign In" : "Sign Up"}</h2>
          <p style={StyleSheet.subtitle}>Use your email or Google Account</p>

          {/* Form */}
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
                  borderColor: errors.email ? "#d32f2f" : formData.email && validateEmail(formData.email) ? "#34a853" : "#dadce0",
                }}
                placeholder="Enter your email"
                required
              />
              {errors.email && <span style={StyleSheet.error}>{errors.email}</span>}
            </div>
            <div style={StyleSheet.inputGroup}>
              <label style={StyleSheet.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                style={{
                  ...StyleSheet.input,
                  borderColor: errors.password ? "#d32f2f" : formData.password && validatePassword(formData.password) ? "#34a853" : "#dadce0",
                }}
                placeholder="Enter your password"
                required
              />
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
                      borderColor: errors.name ? "#d32f2f" : formData.name && validateName(formData.name) ? "#34a853" : "#dadce0",
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
                      borderColor: errors.role ? "#d32f2f" : formData.role ? "#34a853" : "#dadce0",
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
              onSuccess={handleGoogleLogin}
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

        {/* Role Selection Modal for Google Sign-Up */}
        {isRoleModalOpen && (
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
                    borderColor: errors.role ? "#d32f2f" : formData.role ? "#34a853" : "#dadce0",
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

// Styles
const StyleSheet = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #e0e7ff 0%, #f5f5f5 100%)",
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
  tittle: {
    fontSize: "28px",
    color: "green",
    fontWeight: "400",
    marginBottom: "10px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "400",
    color: "#202124",
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
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#3267d6",
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
  googleButtonWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
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
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#3267d6",
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
  toggleContainer: {
    textAlign: "center",
  },
  toggleLink: {
    fontSize: "14px",
    color: "#4285f4",
    cursor: "pointer",
    textDecoration: "underline",
  },
  error: {
    fontSize: "12px",
    color: "#d32f2f",
    marginTop: "5px",
    display: "block",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 40,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    width: "300px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#202124",
    marginBottom: "20px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  cancelButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#5f6368",
    backgroundColor: "#f1f3f4",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  submitButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#fff",
    backgroundColor: "#4285f4",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default LoginAndSign;