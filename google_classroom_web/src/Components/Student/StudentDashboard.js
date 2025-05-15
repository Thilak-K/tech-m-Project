import { useState, useEffect, useRef } from "react";
import { FaBars, FaHome, FaCalendar, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import StudentHome from "./StudentHome";
import StudentCalender from "./StudentCalender";
import StudentSettings from "./StudentSettings";

// Sidebar Item Component
const SidebarItem = ({ item, icon: Icon, isSelected, isHovered, onClick, onMouseEnter, onMouseLeave, isSidebarOpen }) => (
  <li
    style={{
      ...StyleSheet.sidebarItem,
      ...(isHovered ? StyleSheet.sidebarItemHover : {}),
      ...(isSelected ? StyleSheet.sidebarItemSelected : {}),
      ...(item === "logout" ? { marginTop: "auto", position: "absolute", bottom: "20px", width: "87.5%" } : { marginTop: 15 }),
    }}
    onMouseEnter={() => onMouseEnter(item)}
    onMouseLeave={onMouseLeave}
    onClick={() => onClick(item)}
  >
    <Icon style={StyleSheet.sidebarIcon} />
    <span style={{ ...StyleSheet.sidebarText, ...(isSidebarOpen ? StyleSheet.sidebarTextVisible : {}) }}>
      {item.charAt(0).toUpperCase() + item.slice(1)}
    </span>
  </li>
);

// Join Class Modal Component
const JoinClassModal = ({ formData, onChange, onSubmit, onClose }) => (
  <div style={StyleSheet.modalOverlay}>
    <div style={StyleSheet.modal}>
      <h2 style={StyleSheet.modalTitle}>Join a Class</h2>
      <div style={StyleSheet.modalContent}>
        <div style={StyleSheet.formGroup}>
          <label style={StyleSheet.label}>Class Code</label>
          <input
            type="text"
            name="classCode"
            value={formData.classCode}
            onChange={onChange}
            style={StyleSheet.input}
            placeholder="e.g., ABC12345"
            required
          />
        </div>
      </div>
      <div style={StyleSheet.modalActions}>
        <button style={StyleSheet.cancelButton} onClick={onClose}>
          Cancel
        </button>
        <button
          style={StyleSheet.submitButton}
          onClick={onSubmit}
          disabled={!formData.classCode.trim()}
        >
          Join Class
        </button>
      </div>
    </div>
  </div>
);

// Logout Confirmation Modal Component
const LogoutConfirmationModal = ({ onConfirm, onCancel }) => (
  <div style={StyleSheet.modalOverlay}>
    <div style={StyleSheet.modal}>
      <h2 style={StyleSheet.modalTitle}>Confirm Logout</h2>
      <div style={StyleSheet.modalContent}>
        <p style={{ fontSize: "16px", color: "#2d3748", textAlign: "center" }}>
          Are you sure you want to log out?
        </p>
      </div>
      <div style={StyleSheet.modalActions}>
        <button style={StyleSheet.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button style={StyleSheet.submitButton} onClick={onConfirm}>
          Logout
        </button>
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768); // Default open on large screens
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState("home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState(false);
  const [formData, setFormData] = useState({ classCode: "" });
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId || localStorage.getItem("userId");

  // Fetch user details on mount
  useEffect(() => {
    if (!userId) {
      console.error("No userId found. Redirecting to login.");
      navigate("/", { replace: true });
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/auth/users/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (response.ok) {
          setUserDetails(data);
        } else {
          setError(data.message || "Failed to fetch user details.");
          navigate("/", { replace: true });
        }
      } catch (err) {
        setError("An error occurred while fetching user details.");
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, navigate]);

  // Prevent back navigation
  useEffect(() => {
    const preventGoBack = () => {
      window.history.pushState(null, "", window.location.href);
    };
    preventGoBack();
    window.addEventListener("popstate", preventGoBack);
    return () => window.removeEventListener("popstate", preventGoBack);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Adjust sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleItemClick = (item) => {
    if (item === "logout") {
      setShowLogoutConfirm(true);
    } else {
      setSelectedItem(item);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setIsLogoutLoading(true);
    setLogoutMessage("Logging out...");

    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    localStorage.clear();

    setTimeout(() => {
      setLogoutMessage("Successfully Logged Out! Redirecting...");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    }, 2000);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const openJoinClassModal = () => {
    setIsDropdownOpen(false);
    setIsJoinClassModalOpen(true);
  };

  const closeJoinClassModal = () => {
    setIsJoinClassModalOpen(false);
    setFormData({ classCode: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleJoinClass = async () => {
    if (!formData.classCode.trim()) {
      setError("Class code is required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classCode: formData.classCode,
          userId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Class joined successfully:", data);
        closeJoinClassModal();
        setSelectedItem("home");
      } else {
        setError(data.message || "Failed to join class.");
      }
    } catch (err) {
      setError("An error occurred while joining the class.");
    }
  };

  const renderContent = () => {
    switch (selectedItem) {
      case "home":
        return <StudentHome userId={userId} />;
      case "calendar":
        return <StudentCalender userId={userId} />;
      case "settings":
        return <StudentSettings userId={userId} />;
      default:
        return <StudentHome userId={userId} />;
    }
  };

  if (loading) {
    return <div style={StyleSheet.loading}>Loading...</div>;
  }

  if (!userId) {
    return null;
  }

  return (
    <div style={StyleSheet.container}>
      {isLogoutLoading || logoutMessage ? (
        <div style={StyleSheet.logoutOverlay}>
          {isLogoutLoading ? (
            <div style={StyleSheet.logoutLoading}>
              <div style={StyleSheet.spinner}></div>
              <p style={{ fontSize: "20px", color: "#2d3748" }}>{logoutMessage}</p>
            </div>
          ) : (
            <p style={StyleSheet.logoutMessage}>{logoutMessage}</p>
          )}
        </div>
      ) : (
        <>
          <div
            style={{
              ...StyleSheet.sidebar,
              ...(isSidebarOpen || isHovered ? StyleSheet.sidebarExpanded : StyleSheet.sidebarShrunk),
            }}
            onMouseEnter={() => !isSidebarOpen && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <ul style={StyleSheet.sidebarMenu}>
              {["home", "calendar", "settings", "logout"].map((item) => (
                <SidebarItem
                  key={item}
                  item={item}
                  icon={
                    {
                      home: FaHome,
                      calendar: FaCalendar,
                      settings: FaCog,
                      logout: FaSignOutAlt,
                    }[item]
                  }
                  isSelected={selectedItem === item}
                  isHovered={hoveredItem === item}
                  onClick={handleItemClick}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  isSidebarOpen={isSidebarOpen || isHovered}
                />
              ))}
            </ul>
          </div>

          <header style={StyleSheet.header}>
            <div style={StyleSheet.headerLeft}>
              <FaBars style={StyleSheet.toggleIcon} onClick={toggleSidebar} />
              <div style={StyleSheet.logoContainer}>
                <span style={StyleSheet.appName}>Student Classroom</span>
              </div>
            </div>
            <div style={StyleSheet.headerRight}>
              <div style={StyleSheet.dropdownContainer} ref={dropdownRef}>
                <span style={StyleSheet.plusIcon} onClick={toggleDropdown}>+</span>
                {isDropdownOpen && (
                  <div style={StyleSheet.dropdown}>
                    <div style={StyleSheet.dropdownItem} onClick={openJoinClassModal}>
                      Join Class
                    </div>
                  </div>
                )}
              </div>
              <div style={StyleSheet.profileContainer}>
                <div style={StyleSheet.profileIcon}>
                  {userDetails && userDetails.name ? userDetails.name.charAt(0).toUpperCase() : ""}
                </div>
                <span style={StyleSheet.accountName}>
                  {userDetails ? userDetails.name : "Loading..."}
                </span>
              </div>
            </div>
          </header>

          <main
            style={{
              ...StyleSheet.mainContent,
              marginLeft: isSidebarOpen || isHovered ? (window.innerWidth >= 768 ? "200px" : "60px") : "60px",
            }}
          >
            {error && (
              <div style={StyleSheet.errorMessage}>
                {error}
                <button style={StyleSheet.closeErrorButton} onClick={() => setError("")}>
                  ✕
                </button>
              </div>
            )}
            {renderContent()}
          </main>

          {isJoinClassModalOpen && (
            <JoinClassModal
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleJoinClass}
              onClose={closeJoinClassModal}
            />
          )}

          {showLogoutConfirm && (
            <LogoutConfirmationModal
              onConfirm={handleLogoutConfirm}
              onCancel={handleLogoutCancel}
            />
          )}
        </>
      )}
    </div>
  );
};

const StyleSheet = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    overflowX: "hidden",
  },
  sidebar: {
    backgroundColor: "#FFFFFF",
    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
    height: "100vh",
    position: "fixed",
    top: 15,
    left: 0,
    transition: "width 0.3s ease",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
  },
  sidebarShrunk: {
    width: "60px",
  },
  sidebarExpanded: {
    width: "200px",
  },
  sidebarMenu: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    marginTop: "64px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    padding: "15px 5px 15px 20px",
    color: "#5F6368",
    cursor: "pointer",
    transition: "background-color 0.2s ease, color 0.2s ease",
  },
  sidebarItemHover: {
    backgroundColor: "#F1F3F4",
    borderRadius: 20,
  },
  sidebarItemSelected: {
    backgroundColor: "#E8F0FE",
    color: "#1A73E8",
    borderRadius: 20,
  },
  sidebarIcon: {
    fontSize: "24px",
    marginRight: "15px",
    width: "24px",
    flexShrink: 0,
  },
  sidebarText: {
    fontSize: "16px",
    whiteSpace: "nowrap",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  sidebarTextVisible: {
    opacity: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: "10px 10px 10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: 45,
    zIndex: 20,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  toggleIcon: {
    fontSize: "24px",
    color: "#5F6368",
    cursor: "pointer",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  appName: {
    fontSize: "24px",
    fontWeight: "500",
    color: "#000000",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    marginRight: "55px",
    position: "relative",
  },
  dropdownContainer: {
    position: "relative",
  },
  plusIcon: {
    fontSize: "34px",
    fontWeight: "bold",
    color: "#5F6368",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "40px",
    right: 0,
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    borderRadius: "4px",
    zIndex: 30,
    width: "150px",
    overflow: "hidden",
  },
  dropdownItem: {
    padding: "15px 20px",
    fontSize: "18px",
    color: "#202124",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  "dropdownItem:hover": {
    backgroundColor: "#f1f3f4",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
    padding: "2px 10px",
  },
  profileIcon: {
    width: "36px",
    height: "36px",
    backgroundColor: "#C0C0C0",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#707070",
    fontSize: "1.44rem",
    cursor: "pointer",
  },
  accountName: {
    fontSize: "16px",
    color: "#202124",
  },
  mainContent: {
    flex: 1,
    marginTop: "45px",
    transition: "margin-left 0.3s ease",
    minHeight: "calc(100vh - 45px)",
    display: "flex",
    flexDirection: "column",
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
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    width: "400px",
    maxWidth: "90%",
    padding: "30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  modalTitle: {
    fontSize: "1.8rem",
    fontWeight: 600,
    marginBottom: "25px",
    color: "#1a202c",
    textAlign: "center",
    letterSpacing: "0.5px",
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "1rem",
    fontWeight: 500,
    color: "#2d3748",
    marginBottom: "4px",
    letterSpacing: "0.3px",
  },
  input: {
    width: "90%",
    padding: "12px 16px",
    fontSize: "1rem",
    fontFamily: "'Roboto', sans-serif",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#f7fafc",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  "input:focus": {
    borderColor: "#3182ce",
    boxShadow: "0 0 0 3px rgba(49,130,206,0.1)",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "30px",
  },
  cancelButton: {
    padding: "10px 25px",
    fontSize: "1rem",
    fontWeight: 500,
    color: "#ffffff",
    backgroundColor: "#e53e3e",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  "cancelButton:hover": {
    backgroundColor: "#c53030",
    transform: "translateY(-1px)",
  },
  "cancelButton:active": {
    transform: "translateY(0)",
  },
  submitButton: {
    padding: "10px 25px",
    fontSize: "1rem",
    fontWeight: 500,
    color: "#ffffff",
    backgroundColor: "#38a169",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  "submitButton:hover": {
    backgroundColor: "#2f855a",
    transform: "translateY(-1px)",
  },
  "submitButton:active": {
    transform: "translateY(0)",
  },
  "submitButton:disabled": {
    backgroundColor: "#cbd5e0",
    cursor: "not-allowed",
    transform: "none",
  },
  errorMessage: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "10px 15px",
    borderRadius: "8px",
    margin: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
  },
  closeErrorButton: {
    background: "none",
    border: "none",
    color: "#c62828",
    cursor: "pointer",
    fontSize: "1rem",
  },
  loading: {
    textAlign: "center",
    padding: "20px",
    fontSize: "1.2rem",
    color: "#7f8c8d",
  },
  logoutOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(255,255,255,0.95)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
  },
  logoutLoading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #e0e0e0",
    borderTop: "5px solid #38a169",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  logoutMessage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "28px",
    color: "#38a169",
    fontFamily: "'Roboto', sans-serif",
    textAlign: "center",
  },
};

// Keyframes for spinner animation
const styleElement = document.createElement("style");
styleElement.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(styleElement);

export default StudentDashboard;