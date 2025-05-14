import { useState, useCallback, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";

// Constants
const API_BASE_URL = "http://localhost:8080/api/auth";
const GOOGLE_CLIENT_ID = "972539617012-kh3d8l9rnkkqbcdbm4frg2ekqmhaugnt.apps.googleusercontent.com";

// Map API errors to user-friendly messages
const ERROR_MESSAGES = {
  "User not found": "Invalid credentials. Please check your email and password.",
  "Invalid credentials": "Invalid credentials. Please check your email and password.",
  "Email already exists": "This email is already registered. Please sign in.",
  "User signed up with Google. Please use Google login.":
    "This account is registered with Google. Please use Google Sign-In.",
  "Too many requests": "Too many attempts. Please try again later.",
  default: "An error occurred. Please try again.",
};

// Reusable Input Group Component
const InputGroup = ({ label, type = "text", name, value, onChange, onBlur, placeholder, error, isValid, disabled, children, showToggle, toggleIcon: ToggleIcon, toggleAction }) => (
  <div className="input-group">
    <label className="label" htmlFor={name}>
      {label}
    </label>
    <div className="input-wrapper">
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`input ${error ? "error" : isValid ? "valid" : ""}`}
        placeholder={placeholder}
        required
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {showToggle && (
        <span
          onClick={toggleAction}
          className="eye-icon"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && toggleAction()}
          aria-label={type === "text" ? "Hide password" : "Show password"}
        >
          <ToggleIcon />
        </span>
      )}
    </div>
    {error && <span id={`${name}-error`} className="error">{error}</span>}
    {children}
  </div>
);

// Forgot Password Modal Component
const ForgotPasswordModal = ({ email, onChange, onSubmit, onClose, message, resetLink, isLoading }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h2 className="modal-title">Forgot Password</h2>
      <p className="modal-description">
        Enter your email address to receive a password reset link.
      </p>
      <div className="input-group">
        <label className="label" htmlFor="forgot-email">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={onChange}
          className={`input ${message && !resetLink ? "error" : email && /^[^@]+@[^@]+\.[^@]+$/.test(email) ? "valid" : ""}`}
          placeholder="Enter your email"
          disabled={isLoading || resetLink}
          aria-invalid={!!message && !resetLink}
          aria-describedby={message ? "forgot-email-error" : undefined}
        />
        {message && (
          <span
            id="forgot-email-error"
            className="error"
            style={{ color: resetLink ? "#4caf50" : "#ef5350" }}
          >
            {message}
          </span>
        )}
        {resetLink && (
          <div className="reset-link-container">
            <p className="reset-link-text">
              Click the link below to reset your password:
            </p>
            <a
              href={resetLink}
              rel="noopener noreferrer"
              onClick={onClose}
              className="reset-link"
            >
              {resetLink}
            </a>
          </div>
        )}
      </div>
      <div className="modal-actions">
        <button
          className="cancel-button"
          onClick={onClose}
          disabled={isLoading}
          aria-label={resetLink ? "Back to Login" : "Cancel"}
        >
          {resetLink ? "Back to Login" : "Cancel"}
        </button>
        {!resetLink && (
          <button
            className="submit-button"
            onClick={onSubmit}
            disabled={
              !email ||
              !/^[^@]+@[^@]+\.[^@]+$/.test(email) ||
              isLoading
            }
            aria-label="Send Reset Link"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        )}
      </div>
    </div>
  </div>
);

// Role Selection Modal Component
const RoleSelectionModal = ({ role, onChange, onSubmit, onClose, error, isLoading }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h2 className="modal-title">Complete Your Sign-Up</h2>
      <div className="input-group">
        <label className="label" htmlFor="modal-role">
          Role
        </label>
        <select
          id="modal-role"
          name="role"
          value={role}
          onChange={onChange}
          className={`input ${error ? "error" : role ? "valid" : ""}`}
          required
          aria-invalid={!!error}
          aria-describedby={error ? "modal-role-error" : undefined}
        >
          <option value="">Select role</option>
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
        </select>
        {error && <span id="modal-role-error" className="error">{error}</span>}
      </div>
      <div className="modal-actions">
        <button className="cancel-button" onClick={onClose} aria-label="Cancel">
          Cancel
        </button>
        <button
          className="submit-button"
          onClick={onSubmit}
          disabled={!role || isLoading}
          aria-label="Submit"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  </div>
);

const LoginAndSign = () => {
  const [mode, setMode] = useState("signIn");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "",
  });
  const [modalState, setModalState] = useState({
    forgotPassword: {
      isOpen: false,
      email: "",
      message: "",
      resetLink: "",
      isLoading: false,
    },
    roleSelection: {
      isOpen: false,
      googleIdToken: null,
    },
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirectLoading, setIsRedirectLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  

  // Validation functions
  const validateEmail = (email) => /^[^@]+@[^@]+\.[^@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  const validateName = (name) => name.trim().length > 0;

  const validateField = useCallback((name, value) => {
    switch (name) {
      case "email":
        return value && !validateEmail(value) ? "Invalid email format" : "";
      case "password":
        return value && !validatePassword(value)
          ? "Password must be at least 8 characters and include a letter, a number, and a special character"
          : "";
      case "name":
        return value && !validateName(value) ? "Name is required" : "";
      default:
        return "";
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", api: "" }));

    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }, [validateField]);

  const handleInputBlur = useCallback((e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }, [validateField]);

  const toggleShowPassword = useCallback(() => setShowPassword((prev) => !prev), []);

  const apiCall = useCallback(async (url, method, body) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");
      return data;
    } catch (error) {
      throw new Error(error.message || "An error occurred");
    }
  }, []);

  const redirectToDashboard = useCallback((role, userId) => {
    setIsRedirectLoading(true);
    const user = { userId, role };
    localStorage.setItem("user", JSON.stringify(user));
    const targetRoute = role === "STUDENT" ? "/student-dashboard" : "/teacher-dashboard";
    setTimeout(() => {
      setIsRedirectLoading(false);
      setSuccessMessage("");
      navigate(targetRoute, { state: { userId }, replace: true });
    }, 2000);
  }, [navigate]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const { userId, role } = JSON.parse(user);
      const targetRoute = role === "STUDENT" ? "/student-dashboard" : "/teacher-dashboard";
      navigate(targetRoute, { state: { userId }, replace: true });
    }
  }, [navigate]);

  const handleEmailLogin = useCallback(async () => {
    setIsLoading(true);
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiCall(`${API_BASE_URL}/login`, "POST", {
        email: formData.email,
        password: formData.password,
      });
      setSuccessMessage("Login Successful! Redirecting...");
      redirectToDashboard(data.role, data.userId);
    } catch (error) {
      setErrors({ api: ERROR_MESSAGES[error.message] || ERROR_MESSAGES.default });
      setIsLoading(false);
    }
  }, [formData, apiCall, redirectToDashboard]);

  const handleEmailSignUp = useCallback(async () => {
    setIsLoading(true);
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.role) newErrors.role = "Role selection is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiCall(`${API_BASE_URL}/signup`, "POST", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      });
      setSuccessMessage("Signup Successful! Redirecting...");
      redirectToDashboard(data.role, data.userId);
    } catch (error) {
      setErrors({ api: ERROR_MESSAGES[error.message] || ERROR_MESSAGES.default });
      setIsLoading(false);
    }
  }, [formData, apiCall, redirectToDashboard]);

  const handleGoogleLogin = useCallback(async (credentialResponse) => {
    setIsLoading(true);
    try {
      const data = await apiCall(`${API_BASE_URL}/google-login`, "POST", {
        token: credentialResponse.credential,
      });
      setSuccessMessage("Google Login Successful! Redirecting...");
      redirectToDashboard(data.role, data.userId);
    } catch (error) {
      console.error("Google API Call Error:", error);
      setErrors({ api: ERROR_MESSAGES[error.message] || ERROR_MESSAGES.default });
      setIsLoading(false);
    }
  }, [apiCall, redirectToDashboard]);

  const handleGoogleSignUp = useCallback(async () => {
    const { googleIdToken } = modalState.roleSelection;
    if (!googleIdToken || !formData.role) {
      setErrors({ api: "Please select a role to continue." });
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiCall(`${API_BASE_URL}/google-signup`, "POST", {
        token: googleIdToken,
        role: formData.role,
      });
      setSuccessMessage("Google Signup Successful! Redirecting...");
      redirectToDashboard(data.role, data.userId);
      setModalState((prev) => ({ ...prev, roleSelection: { isOpen: false, googleIdToken: null } }));
    } catch (error) {
      console.error("Google API Call Error:", error);
      setErrors({ api: ERROR_MESSAGES[error.message] || ERROR_MESSAGES.default });
      setIsLoading(false);
    }
  }, [formData.role, modalState.roleSelection, apiCall, redirectToDashboard]);

  const openForgotPasswordModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      forgotPassword: { isOpen: true, email: "", message: "", resetLink: "", isLoading: false },
    }));
  }, []);

  const closeForgotPasswordModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      forgotPassword: { isOpen: false, email: "", message: "", resetLink: "", isLoading: false },
    }));
  }, []);

  const handleForgotPasswordSubmit = debounce(async () => {
    const { email } = modalState.forgotPassword;
    if (!email) {
      setModalState((prev) => ({
        ...prev,
        forgotPassword: { ...prev.forgotPassword, message: "Please enter your email." },
      }));
      return;
    }

    if (!validateEmail(email)) {
      setModalState((prev) => ({
        ...prev,
        forgotPassword: { ...prev.forgotPassword, message: "Please enter a valid email." },
      }));
      return;
    }

    setModalState((prev) => ({
      ...prev,
      forgotPassword: { ...prev.forgotPassword, isLoading: true },
    }));
    try {
      const data = await apiCall(`${API_BASE_URL}/forgot-password`, "POST", { email });
      setModalState((prev) => ({
        ...prev,
        forgotPassword: {
          ...prev.forgotPassword,
          message: data.message || "Reset link generated.",
          resetLink: data.data || "",
          isLoading: false,
        },
      }));
    } catch (error) {
      setModalState((prev) => ({
        ...prev,
        forgotPassword: {
          ...prev.forgotPassword,
          message: ERROR_MESSAGES[error.message] || ERROR_MESSAGES.default,
          isLoading: false,
        },
      }));
    }
  }, 500);

  const toggleMode = useCallback(() => {
    setMode((prevMode) => (prevMode === "signIn" ? "signUp" : "signIn"));
    setFormData({ email: "", password: "", name: "", role: "" });
    setErrors({});
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="page-container">
        {isRedirectLoading ? (
          <div className="loading-container">
            {successMessage ? (
              <p className="success-message">{successMessage}</p>
            ) : (
              <>
                <div className="spinner"></div>
                <p className="loading-text">Loading...</p>
              </>
            )}
          </div>
        ) : (
          <div className="login-card">
            <h1 className="tittle">Classroom</h1>
            <h2 className="title">{mode === "signIn" ? "Sign In" : "Sign Up"}</h2>
            <p className="subtitle">Use your email or Google Account to continue</p>

            <div className="form-container">
              <InputGroup
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Enter your email"
                error={errors.email}
                isValid={formData.email && validateEmail(formData.email)}
              />
              <InputGroup
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="Enter your password"
                error={errors.password}
                isValid={formData.password && validatePassword(formData.password)}
                showToggle
                toggleIcon={showPassword ? FaEye : FaEyeSlash}
                toggleAction={toggleShowPassword}
              >
                {mode === "signIn" && (
                  <span
                    className="forgot-password-link"
                    onClick={openForgotPasswordModal}
                    onKeyDown={(e) => e.key === "Enter" && openForgotPasswordModal()}
                    role="button"
                    tabIndex={0}
                    aria-label="Forgot Password"
                  >
                    Forgot Password?
                  </span>
                )}
              </InputGroup>
              {mode === "signUp" && (
                <>
                  <InputGroup
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="Enter your name"
                    error={errors.name}
                    isValid={formData.name && validateName(formData.name)}
                  />
                  <div className="input-group">
                    <label className="label" htmlFor="role">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`input ${errors.role ? "error" : formData.role ? "valid" : ""}`}
                      required
                      aria-invalid={!!errors.role}
                      aria-describedby={errors.role ? "role-error" : undefined}
                    >
                      <option value="">Select role</option>
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                    </select>
                    {errors.role && <span id="role-error" className="error">{errors.role}</span>}
                  </div>
                </>
              )}
              <button
                className="email-signin-button"
                onClick={mode === "signIn" ? handleEmailLogin : handleEmailSignUp}
                disabled={
                  mode === "signIn"
                    ? !formData.email || !formData.password || isLoading
                    : !formData.email || !formData.password || !formData.name || !formData.role || isLoading
                }
                aria-label={mode === "signIn" ? "Sign In" : "Sign Up"}
              >
                {isLoading ? "Loading..." : mode === "signIn" ? "Sign In" : "Sign Up"}
              </button>
              {errors.api && <span className="error">{errors.api}</span>}
            </div>

            <div className="separator">
              <span className="separator-text">OR</span>
            </div>

            <div className="google-button-wrapper">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (mode === "signIn") {
                    handleGoogleLogin(credentialResponse);
                  } else {
                    setModalState((prev) => ({
                      ...prev,
                      roleSelection: { isOpen: true, googleIdToken: credentialResponse.credential },
                    }));
                  }
                }}
                onError={() => setErrors({ api: "Google login failed. Please try again." })}
                render={(renderProps) => (
                  <button
                    className="google-button"
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled || isLoading}
                    aria-label={mode === "signIn" ? "Sign in with Google" : "Sign up with Google"}
                  >
                    <FcGoogle className="google-icon" />
                    <span className="button-text">
                      {mode === "signIn" ? "Sign in with Google" : "Sign up with Google"}
                    </span>
                  </button>
                )}
              />
            </div>

            <div className="toggle-container">
              <span
                className="toggle-link"
                onClick={toggleMode}
                onKeyDown={(e) => e.key === "Enter" && toggleMode()}
                role="button"
                tabIndex={0}
                aria-label={mode === "signIn" ? "Switch to Sign Up" : "Switch to Sign In"}
              >
                {mode === "signIn" ? "New user? Sign Up" : "Already have an account? Sign In"}
              </span>
            </div>
          </div>
        )}

        {modalState.forgotPassword.isOpen && !isRedirectLoading && (
          <ForgotPasswordModal
            email={modalState.forgotPassword.email}
            onChange={(e) => setModalState((prev) => ({
              ...prev,
              forgotPassword: { ...prev.forgotPassword, email: e.target.value },
            }))}
            onSubmit={handleForgotPasswordSubmit}
            onClose={closeForgotPasswordModal}
            message={modalState.forgotPassword.message}
            resetLink={modalState.forgotPassword.resetLink}
            isLoading={modalState.forgotPassword.isLoading}
          />
        )}

        {modalState.roleSelection.isOpen && !isRedirectLoading && (
          <RoleSelectionModal
            role={formData.role}
            onChange={handleInputChange}
            onSubmit={handleGoogleSignUp}
            onClose={() => {
              setModalState((prev) => ({
                ...prev,
                roleSelection: { isOpen: false, googleIdToken: null },
              }));
              setFormData((prev) => ({ ...prev, role: "" }));
            }}
            error={errors.api}
            isLoading={isLoading}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

// CSS for LoginAndSign
const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .page-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #f0f4ff 0%, #e6efff 100%);
    font-family: 'Inter', sans-serif;
  }
  .login-card {
    background-color: #ffffff;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
    transition: transform 0.2s ease-in-out;
  }
  .tittle {
    font-size: 2rem;
    color: #2e7d32;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .title {
    font-size: 1.5rem;
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 0.75rem;
  }
  .subtitle {
    font-size: 1rem;
    color: #666;
    margin-bottom: 2rem;
  }
  .form-container {
    margin-bottom: 1.5rem;
  }
  .input-group {
    margin-bottom: 1.5rem;
    text-align: left;
  }
  .input-wrapper {
    position: relative;
  }
  .label {
    font-size: 1rem;
    font-weight: 500;
    color: #000;
    margin-bottom: 0.5rem;
    display: block;
  }
  .input {
    width: 91%;
    padding: 12px;
    font-size: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    outline: none;
    color: #1a1a1a;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  .input.error {
    border-color: #ef5350;
  }
  .input.valid {
    border-color: #4caf50;
  }
  .eye-icon {
    position: absolute;
    right: 25px;
    top: 55%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #666;
    font-size: 1.2rem;
  }
  .forgot-password-link {
    font-size: 0.9rem;
    color: #3b82f6;
    cursor: pointer;
    text-decoration: underline;
    display: block;
    margin-top: 0.5rem;
    text-align: right;
  }
  .forgot-password-link:hover {
    color: #2563eb;
  }
  .email-signin-button {
    width: 97%;
    padding: 12px;
    background-color: #3b82f6;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 500;
    color: #ffffff;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
  }
  .email-signin-button:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
  }
  .email-signin-button:active {
    transform: translateY(0);
  }
  .email-signin-button:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
  .separator {
    position: relative;
    margin: 1.5rem 0;
    text-align: center;
  }
  .separator:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    border-top: 1px solid #000000;
  }
  .separator-text {
    background-color: #ffffff;
    padding: 0 12px;
    font-size: 0.9rem;
    color: #000;
    position: relative;
    z-index: 1;
  }
  .google-button-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  .google-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px 30px;
    background-color: #ffffff;
    border: 1px solid rgb(195, 175, 175);
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s, box-shadow 0.2s;
  }
  .google-button:hover {
    background-color: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .google-button:active {
    transform: translateY(0);
  }
  .google-icon {
    font-size: 1.8rem;
  }
  .button-text {
    font-size: 1.5rem;
    font-weight: 500;
    color: #1a1a1a;
  }
  .toggle-container {
    text-align: center;
  }
  .toggle-link {
    font-size: 0.9rem;
    color: #3b82f6;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.2s;
  }
  .toggle-link:hover {
    color: #2563eb;
  }
  .error {
    font-size: 0.85rem;
    color: #ef5350;
    margin-top: 0.5rem;
    display: block;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 40;
  }
  .modal {
    background-color: #fff;
    border-radius: 12px;
    width: 320px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    transform: scale(0.95);
    transition: transform 0.2s ease-in-out;
  }
  .modal-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
  }
  .modal-description {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
  }
  .reset-link-container {
    margin-top: 1rem;
  }
  .reset-link-text {
    font-size: 0.9rem;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
  }
  .reset-link {
    font-size: 0.9rem;
    color: #3b82f6;
    text-decoration: underline;
    word-break: break-all;
  }
  .reset-link:hover {
    color: #2563eb;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 1.5rem;
  }
  .cancel-button {
    padding: 10px 20px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
    background-color: #FF7F7F;
    border: 2px solid #cc0202;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .cancel-button:hover {
    background-color: #e5e7eb;
  }
  .submit-button {
    padding: 10px 20px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #fff;
    background-color: #3b82f6;
    border: 2px solid #3b12f9;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
  }
  .submit-button:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
  }
  .submit-button:active {
    transform: translateY(0);
  }
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e0e0e0;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .loading-text {
    font-size: 1.1rem;
    color: #1a1a1a;
    font-weight: 500;
  }
  .success-message {
    font-size: 1.2rem;
    color: #4caf50;
    font-weight: 500;
    text-align: center;
    animation: fadeIn 0.5s ease-in-out;
  }
`;
document.head.appendChild(styleSheet);

export default LoginAndSign;