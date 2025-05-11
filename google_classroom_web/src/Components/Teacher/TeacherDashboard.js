import React, { useState, useEffect, useRef } from "react";
import {
  FaBars,
  FaHome,
  FaCalendar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import TeacherHome from "./TeacherHome";
import TeacherCalender from "./TeacherCalender";
import TeacherSettings from "./TeacherSettings";

const TeacherDashboard = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState("home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    classId: "",
    classCode: "",
    subjectCode: "",
    section: "",
    subject: "",
    teacherName: "",
  });
  const [joinClassCode, setJoinClassCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve userId from location.state or localStorage
  const userId = location.state?.userId || localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      console.error("No userId found in location.state or localStorage. Redirecting to login.");
      navigate("/", { replace: true });
      return;
    }

    // Store userId in localStorage for future use
    localStorage.setItem("userId", userId);
    console.log("Stored userId in localStorage:", userId);

    // Fetch user details
    const fetchUserDetails = async () => {
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
          setFormData((prev) => ({ ...prev, teacherName: data.name || "" }));
        } else {
          setError(data.message || "Failed to fetch user details.");
          navigate("/", { replace: true }); // Redirect to login if user not found
        }
      } catch (err) {
        setError("An error occurred while fetching user details.");
        navigate("/", { replace: true }); // Redirect to login on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, navigate]);

  useEffect(() => {
    const preventGoBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    preventGoBack();
    window.addEventListener("popstate", preventGoBack);

    return () => {
      window.removeEventListener("popstate", preventGoBack);
    };
  }, []);

  const generateClassCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleItemClick = (item) => {
    if (item === "logout") {
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      navigate("/", { replace: true });
    } else {
      setSelectedItem(item);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const openCreateClassModal = () => {
    setIsDropdownOpen(false);
    const newClassId = uuidv4();
    const newClassCode = generateClassCode();
    setFormData((prev) => ({
      ...prev,
      classId: newClassId,
      classCode: newClassCode,
      subjectCode: "",
      section: "",
      subject: "",
    }));
    setIsCreateClassModalOpen(true);
  };

  const closeCreateClassModal = () => {
    setIsCreateClassModalOpen(false);
    setFormData((prev) => ({
      ...prev,
      classId: "",
      classCode: "",
      subjectCode: "",
      section: "",
      subject: "",
    }));
  };

  const openJoinClassModal = () => {
    setIsDropdownOpen(false);
    setIsJoinClassModalOpen(true);
    setJoinClassCode(""); // Reset join class code
  };

  const closeJoinClassModal = () => {
    setIsJoinClassModalOpen(false);
    setJoinClassCode("");
    setJoinError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "classCode") {
      setJoinClassCode(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateClass = async () => {
    if (
      formData.subjectCode.trim() &&
      formData.section.trim() &&
      formData.subject.trim() &&
      formData.teacherName.trim() &&
      formData.classCode.trim()
    ) {
      try {
        const response = await fetch("http://localhost:8080/api/classes/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classId: formData.classId,
            classCode: formData.classCode,
            subjectCode: formData.subjectCode,
            section: formData.section,
            subject: formData.subject,
            teacherName: formData.teacherName,
            userId: userId,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log("Class created successfully:", data);
          closeCreateClassModal();
          setSelectedItem("home"); // Refresh the class list
        } else {
          setError(data.message || "Failed to create class.");
        }
      } catch (err) {
        setError("An error occurred while creating the class.");
      }
    } else {
      setError("Please fill in all fields.");
    }
  };

  const handleJoinClass = async () => {
    if (!joinClassCode.trim()) {
      setJoinError("Class code is required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/classes/join", {
        classCode: joinClassCode,
        userId,
      });
      if (response.status === 200) {
        closeJoinClassModal();
        setSelectedItem("home"); // Refresh the class list
      }
    } catch (err) {
      setJoinError(err.response?.data?.message || "Failed to join class. Please try again.");
      console.error("Error joining class:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderContent = () => {
    switch (selectedItem) {
      case "home":
        return <TeacherHome userId={userId} />;
      case "calender":
        return <TeacherCalender userid={userId} />;
      case "settings":
        return <TeacherSettings userid={userId} />;
      case "logout":
        return <div>Logout Action Placeholder</div>;
      default:
        return <TeacherHome userId={userId} />;
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>;
  }

  if (!userId) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <div style={StyleSheet.container}>
      <div
        style={{
          ...StyleSheet.sidebar,
          ...(isSidebarOpen || isHovered
            ? StyleSheet.sidebarExpanded
            : StyleSheet.sidebarShrunk),
        }}
        onMouseEnter={() => !isSidebarOpen && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ul style={StyleSheet.sidebarMenu}>
          <li
            style={{
              ...StyleSheet.sidebarItem,
              ...(hoveredItem === "home" ? StyleSheet.sidebarItemHover : {}),
              ...(selectedItem === "home"
                ? StyleSheet.sidebarItemSelected
                : {}),
            }}
            onMouseEnter={() => setHoveredItem("home")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => handleItemClick("home")}
          >
            <FaHome style={StyleSheet.sidebarIcon} />
            <span
              style={{
                ...StyleSheet.sidebarText,
                ...(isSidebarOpen || isHovered
                  ? StyleSheet.sidebarTextVisible
                  : {}),
              }}
            >
              Home
            </span>
          </li>

          <li
            style={{
              ...StyleSheet.sidebarItem,
              ...(hoveredItem === "calender"
                ? StyleSheet.sidebarItemHover
                : {}),
              ...(selectedItem === "calender"
                ? StyleSheet.sidebarItemSelected
                : {}),
            }}
            onMouseEnter={() => setHoveredItem("calender")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => handleItemClick("calender")}
          >
            <FaCalendar style={StyleSheet.sidebarIcon} />
            <span
              style={{
                ...StyleSheet.sidebarText,
                ...(isSidebarOpen || isHovered
                  ? StyleSheet.sidebarTextVisible
                  : {}),
              }}
            >
              Calender
            </span>
          </li>

          <li
            style={{
              ...StyleSheet.sidebarItem,
              ...(hoveredItem === "settings"
                ? StyleSheet.sidebarItemHover
                : {}),
              ...(selectedItem === "settings"
                ? StyleSheet.sidebarItemSelected
                : {}),
            }}
            onMouseEnter={() => setHoveredItem("settings")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => handleItemClick("settings")}
          >
            <FaCog style={StyleSheet.sidebarIcon} />
            <span
              style={{
                ...StyleSheet.sidebarText,
                ...(isSidebarOpen || isHovered
                  ? StyleSheet.sidebarTextVisible
                  : {}),
              }}
            >
              Settings
            </span>
          </li>

          <li
            style={{
              ...StyleSheet.sidebarItem,
              ...(hoveredItem === "logout" ? StyleSheet.sidebarItemHover : {}),
              ...(selectedItem === "logout"
                ? StyleSheet.sidebarItemSelected
                : {}),
              marginTop: "auto",
              position: "absolute",
              bottom: "20px",
              width: "87.5%",
            }}
            onMouseEnter={() => setHoveredItem("logout")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => handleItemClick("logout")}
          >
            <FaSignOutAlt style={StyleSheet.sidebarIcon} />
            <span
              style={{
                ...StyleSheet.sidebarText,
                ...(isSidebarOpen || isHovered
                  ? StyleSheet.sidebarTextVisible
                  : {}),
              }}
            >
              Logout
            </span>
          </li>
        </ul>
      </div>
      <header style={StyleSheet.header}>
        <div style={StyleSheet.headerLeft}>
          <FaBars style={StyleSheet.toggleIcon} onClick={toggleSidebar} />
          <div style={StyleSheet.logoContainer}>
            <span style={StyleSheet.appName}>Teacher Classroom</span>
          </div>
        </div>
        <div style={StyleSheet.headerRight}>
          <div style={StyleSheet.dropdownContainer} ref={dropdownRef}>
            <span style={StyleSheet.plusIcon} onClick={toggleDropdown}>
              +
            </span>
            {isDropdownOpen && (
              <div style={StyleSheet.dropdown}>
                <div
                  style={StyleSheet.dropdownItem}
                  onClick={openCreateClassModal}
                >
                  Create class
                </div>
                <div
                  style={StyleSheet.dropdownItem}
                  onClick={openJoinClassModal}
                >
                  Join class
                </div>
              </div>
            )}
          </div>

          <div style={StyleSheet.profilecontiner}>
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
          flex: 1,
          marginTop: "45px",
          marginLeft: isSidebarOpen || isHovered ? "230px" : "60px",
          transition: "margin-left 0.3s ease",
          minHeight: "calc(100vh - 45px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
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
        {renderContent()}
      </main>

      {/* Create Class Modal */}
      {isCreateClassModalOpen && (
        <div style={StyleSheet.modalOverlay}>
          <div style={StyleSheet.modal}>
            <h2 style={StyleSheet.modalTitle}>Create Class</h2>
            <div style={StyleSheet.modalContent}>
              <label style={StyleSheet.label}>Class Code</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="text"
                  value={formData.classCode}
                  style={{ ...StyleSheet.input, backgroundColor: "#f0f0f0" }}
                  disabled
                />
                <button
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  onClick={() => navigator.clipboard.writeText(formData.classCode).then(() => alert("Class code copied to clipboard!"))}
                >
                  Copy
                </button>
              </div>
              <label style={StyleSheet.label}>Section</label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                style={StyleSheet.input}
                placeholder="Enter section"
                required
              />
              <label style={StyleSheet.label}>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                style={StyleSheet.input}
                placeholder="Enter subject"
                required
              />
              <label style={StyleSheet.label}>Subject Code</label>
              <input
                type="text"
                name="subjectCode"
                value={formData.subjectCode}
                onChange={handleInputChange}
                style={StyleSheet.input}
                placeholder="Enter subject Code"
                required
              />
              <label style={StyleSheet.label}>Teacher Name</label>
              <input
                type="text"
                value={formData.teacherName}
                style={{ ...StyleSheet.input, backgroundColor: "#f0f0f0" }}
                disabled
              />
            </div>
            <div style={StyleSheet.modalActions}>
              <button
                style={StyleSheet.cancelButton}
                onClick={closeCreateClassModal}
              >
                Cancel
              </button>
              <button
                style={StyleSheet.submitButton}
                onClick={handleCreateClass}
                disabled={
                  !formData.subjectCode.trim() ||
                  !formData.section.trim() ||
                  !formData.subject.trim() ||
                  !formData.teacherName.trim() ||
                  !formData.classCode.trim()
                }
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Class Modal */}
      {isJoinClassModalOpen && (
        <div style={StyleSheet.modalOverlay}>
          <div style={StyleSheet.modal}>
            <h2 style={StyleSheet.modalTitle}>Join Class</h2>
            <div style={StyleSheet.modalContent}>
              <label style={StyleSheet.label}>Class Code</label>
              <input
                type="text"
                name="classCode"
                value={joinClassCode}
                onChange={handleInputChange}
                style={StyleSheet.input}
                placeholder="Enter class code"
                required
              />
              {joinError && (
                <div style={{ color: "red", marginTop: "10px" }}>{joinError}</div>
              )}
            </div>
            <div style={StyleSheet.modalActions}>
              <button
                style={StyleSheet.cancelButton}
                onClick={closeJoinClassModal}
              >
                Cancel
              </button>
              <button
                style={StyleSheet.submitButton}
                onClick={handleJoinClass}
                disabled={!joinClassCode.trim()}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const StyleSheet = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
  },
  sidebar: {
    backgroundColor: "#FFFFFF",
    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
    height: "100vh",
    position: "fixed",
    top: 15,
    left: 0,
    transition: "width 0.3s ease",
    overflow: "visible",
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
    padding: "0",
    margin: "0",
    marginTop: "64px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  sidebarItem: {
    margin: 0,
    display: "flex",
    marginTop: 15,
    alignItems: "center",
    padding: "15px 5px 15px 20px",
    color: "#5F6368",
    cursor: "pointer",
    transition: "background-color 0.2s",
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
    right: "0",
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
  profilecontiner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
    padding: "2px 10px",
  },
  profileIcon: {
    width: "36px",
    height: "36px",
    backgroundColor: " #C0C0C0",
    borderRadius: "50%",
    display: "flex",
    alignItems: 'center',
    justifyContent: "center",
    color: "#707070",
    fontSize: "1.44rem",
    cursor: "pointer",

  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    width: "400px",
    maxWidth: "100%",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    width: "90%",
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s ease",
    "&:focus": {
      borderColor: "#1abc9c",
    },
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  cancelButton: {
    padding: "10px 20px",
    fontSize: "0.9rem",
    color: "#666",
    backgroundColor: "#f0f0f0",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  },
  submitButton: {
    padding: "10px 20px",
    fontSize: "0.9rem",
    color: "#ffffff",
    backgroundColor: "#1abc9c",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#16a085",
    },
    "&:disabled": {
      backgroundColor: "#bdc3c7",
      cursor: "not-allowed",
    },
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
}

export default TeacherDashboard;