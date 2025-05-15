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

// Sidebar Item Component
const SidebarItem = ({ item, icon: Icon, isSelected, isHovered, onClick, onMouseEnter, onMouseLeave, isSidebarOpen }) => (
  <li
    className={`sidebar-item ${isSelected ? "selected" : ""} ${isHovered ? "hovered" : ""}`}
    onClick={() => onClick(item)}
    onMouseEnter={() => onMouseEnter(item)}
    onMouseLeave={onMouseLeave}
    style={item === "logout" ? { marginTop: "auto", position: "absolute", bottom: "20px", width: "87.5%" } : {}}
  >
    <Icon className="sidebar-icon" />
    <span className={`sidebar-text ${isSidebarOpen ? "visible" : ""}`}>
      {item.charAt(0).toUpperCase() + item.slice(1)}
    </span>
  </li>
);

// Modal Components
const CreateClassModal = ({ formData, onChange, onSubmit, onClose, onCopy }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h2 className="modal-title">Create a New Class</h2>
      <div className="modal-content">
        <div className="form-group">
          <label className="label">Class Code</label>
          <div className="class-code-container">
            <input
              type="text"
              value={formData.classCode}
              className="input disabled"
              disabled
            />
            <button className="copy-button" onClick={onCopy}>
              Copy 
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="label">Section</label>
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={onChange}
            className="input"
            placeholder="e.g., Section A"
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={onChange}
            className="input"
            placeholder="e.g., Mathematics"
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Subject Code</label>
          <input
            type="text"
            name="subjectCode"
            value={formData.subjectCode}
            onChange={onChange}
            className="input"
            placeholder="e.g., MATH101"
            required
          />
        </div>
      </div>
      <div className="modal-actions">
        <button className="cancel-button" onClick={onClose}>
          Cancel
        </button>
        <button
          className="submit-button"
          onClick={onSubmit}
          disabled={
            !formData.subjectCode.trim() ||
            !formData.section.trim() ||
            !formData.subject.trim() ||
            !formData.classCode.trim()
          }
        >
          Create Class
        </button>
      </div>
    </div>
  </div>
);

const JoinClassModal = ({ joinClassCode, onChange, onSubmit, onClose, joinError }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h2 className="modal-title">Join Class</h2>
      <div className="modal-content">
        <label className="label">Class Code</label>
        <input
          type="text"
          name="classCode"
          value={joinClassCode}
          onChange={onChange}
          className="input"
          placeholder="Enter class code"
          required
        />
        {joinError && <div className="error-message">{joinError}</div>}
      </div>
      <div className="modal-actions">
        <button className="cancel-button" onClick={onClose}>
          Cancel
        </button>
        <button
          className="submit-button"
          onClick={onSubmit}
          disabled={!joinClassCode.trim()}
        >
          Join
        </button>
      </div>
    </div>
  </div>
);

const LogoutConfirmationModal = ({ onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h2 className="modal-title">Confirm Logout</h2>
      <div className="modal-content">
        <p>Are you sure you want to log out?</p>
      </div>
      <div className="modal-actions">
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="submit-button" onClick={onConfirm}>
          Logout
        </button>
      </div>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState("home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalState, setModalState] = useState({
    type: null,
    data: {
      classId: "",
      classCode: "",
      subjectCode: "",
      section: "",
      subject: "",
      teacherName: "",
    },
    joinClassCode: "",
    joinError: "",
  });
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");
  const [refreshClasses, setRefreshClasses] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const user = localStorage.getItem("user");
  const userId = user ? JSON.parse(user).userId : location.state?.userId;

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
          setModalState((prev) => ({
            ...prev,
            data: { ...prev.data, teacherName: data.name || "" },
          }));
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

  // Utility to generate class code
  const generateClassCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

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
    localStorage.removeItem("user");
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

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const openCreateClassModal = () => {
    setIsDropdownOpen(false);
    const newClassId = uuidv4();
    const newClassCode = generateClassCode();
    setModalState({
      type: "create",
      data: {
        classId: newClassId,
        classCode: newClassCode,
        subjectCode: "",
        section: "",
        subject: "",
        teacherName: userDetails?.name || "",
      },
      joinClassCode: "",
      joinError: "",
    });
  };

  const closeModal = () => {
    setModalState({
      type: null,
      data: {
        classId: "",
        classCode: "",
        subjectCode: "",
        section: "",
        subject: "",
        teacherName: userDetails?.name || "",
      },
      joinClassCode: "",
      joinError: "",
    });
  };

  const openJoinClassModal = () => {
    setIsDropdownOpen(false);
    setModalState({
      type: "join",
      data: {},
      joinClassCode: "",
      joinError: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "classCode") {
      setModalState((prev) => ({ ...prev, joinClassCode: value }));
    } else {
      setModalState((prev) => ({
        ...prev,
        data: { ...prev.data, [name]: value },
      }));
    }
  };

  const handleCreateClass = async () => {
    const { classId, classCode, subjectCode, section, subject, teacherName } = modalState.data;
    if (subjectCode.trim() && section.trim() && subject.trim() && classCode.trim()) {
      try {
        const response = await fetch("http://localhost:8080/api/classes/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId,
            classCode,
            subjectCode,
            section,
            subject,
            teacherName,
            userId,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Class created successfully:", data);
          closeModal();
          setRefreshClasses((prev) => prev + 1);
          setSelectedItem("home");
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
    const { joinClassCode } = modalState;
    if (!joinClassCode.trim()) {
      setModalState((prev) => ({ ...prev, joinError: "Class code is required." }));
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/classes/join", {
        classCode: joinClassCode,
        userId,
      });
      if (response.status === 200) {
        closeModal();
        setRefreshClasses((prev) => prev + 1);
        setSelectedItem("home");
      }
    } catch (err) {
      setModalState((prev) => ({
        ...prev,
        joinError: err.response?.data?.message || "Failed to join class. Please try again.",
      }));
      console.error("Error joining class:", err.response?.data || err.message);
    }
  };

  const renderContent = () => {
    switch (selectedItem) {
      case "home":
        return <TeacherHome userId={userId} refreshClasses={refreshClasses} />;
      case "calender":
        return <TeacherCalender userId={userId} />;
      case "settings":
        return <TeacherSettings userId={userId} />;
      default:
        return <TeacherHome userId={userId} refreshClasses={refreshClasses} />;
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {isLogoutLoading || logoutMessage ? (
        <div className="logout-overlay">
          {isLogoutLoading ? (
            <div className="logout-loading">
              <div className="spinner"></div>
              <p>{logoutMessage}</p>
            </div>
          ) : (
            <p className="logout-message">{logoutMessage}</p>
          )}
        </div>
      ) : (
        <>
          <div
            className={`sidebar ${isSidebarOpen || isHovered ? "expanded" : "shrunk"}`}
            onMouseEnter={() => !isSidebarOpen && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <ul className="sidebar-menu">
              {["home", "calender", "settings", "logout"].map((item) => (
                <SidebarItem
                  key={item}
                  item={item}
                  icon={
                    {
                      home: FaHome,
                      calender: FaCalendar,
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

          <header className="header">
            <div className="header-left">
              <FaBars className="toggle-icon" onClick={toggleSidebar} />
              <div className="logo-container">
                <span className="app-name">Teacher Classroom</span>
              </div>
            </div>
            <div className="header-right">
              <div className="dropdown-container" ref={dropdownRef}>
                <span className="plus-icon" onClick={toggleDropdown}>+</span>
                {isDropdownOpen && (
                  <div className="dropdown">
                    <div className="dropdown-item" onClick={openCreateClassModal}>
                      Create class
                    </div>
                    <div className="dropdown-item" onClick={openJoinClassModal}>
                      Join class
                    </div>
                  </div>
                )}
              </div>
              <div className="profile-container">
                <div className="profile-icon">
                  {userDetails && userDetails.name ? userDetails.name.charAt(0).toUpperCase() : ""}
                </div>
                <span className="account-name">
                  {userDetails ? userDetails.name : "Loading..."}
                </span>
              </div>
            </div>
          </header>

          <main className={`main-content ${isSidebarOpen || isHovered ? "expanded" : "shrunk"}`}>
            {error && (
              <div className="error-message">
                {error}
                <button className="close-error-button" onClick={() => setError("")}>
                  ✕
                </button>
              </div>
            )}
            {renderContent()}
          </main>

          {modalState.type === "create" && (
            <CreateClassModal
              formData={modalState.data}
              onChange={handleInputChange}
              onSubmit={handleCreateClass}
              onClose={closeModal}
              onCopy={() => navigator.clipboard.writeText(modalState.data.classCode).then(() => alert("Class code copied to clipboard!"))}
            />
          )}

          {modalState.type === "join" && (
            <JoinClassModal
              joinClassCode={modalState.joinClassCode}
              onChange={handleInputChange}
              onSubmit={handleJoinClass}
              onClose={closeModal}
              joinError={modalState.joinError}
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

// Updated CSS for TeacherDashboard
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
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .dashboard-container {
    display: flex;
    min-height: 100vh;
    width: 100vw;
    overflow-x: hidden;
  }
  .sidebar {
    background-color: #FFFFFF;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    height: 100vh;
    position: fixed;
    top: 15px;
    left: 0;
    transition: width 0.3s ease-in-out;
    z-index: 10;
    display: flex;
    flex-direction: column;
  }
  .sidebar.shrunk {
    width: 60px;
  }
  .sidebar.expanded {
    width: 200px;
  }
  .sidebar-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    margin-top: 64px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .sidebar-item {
    margin: 0;
    display: flex;
    margin-top: 15px;
    align-items: center;
    padding: 15px 5px 15px 20px;
    color: #5F6368;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
  }
  .sidebar-item.hovered {
    background-color: #F1F3F4;
    border-radius: 20px;
  }
  .sidebar-item.selected {
    background-color: #E8F0FE;
    color: #1A73E8;
    border-radius: 20px;
  }
  .sidebar-icon {
    font-size: 24px;
    margin-right: 15px;
    width: 24px;
    flex-shrink: 0;
  }
  .sidebar-text {
    font-size: 16px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .sidebar-text.visible {
    opacity: 1;
  }
  .header {
    background-color: #FFFFFF;
    padding: 10px 10px 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 45px;
    z-index: 20;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .toggle-icon {
    font-size: 24px;
    color: #5F6368;
    cursor: pointer;
  }
  .logo-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .app-name {
    font-size: 24px;
    font-weight: 500;
    color: #000000;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 25px;
    margin-right: 55px;
    position: relative;
  }
  .dropdown-container {
    position: relative;
  }
  .plus-icon {
    font-size: 34px;
    font-weight: bold;
    color: #5F6368;
    cursor: pointer;
  }
  .dropdown {
    position: absolute;
    top: 40px;
    right: 0;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    border-radius: 4px;
    z-index: 30;
    width: 150px;
    overflow: hidden;
  }
  .dropdown-item {
    padding: 15px 20px;
    font-size: 18px;
    color: #202124;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .dropdown-item:hover {
    background-color: #f1f3f4;
  }
  .profile-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
    padding: 2px 10px;
  }
  .profile-icon {
    width: 36px;
    height: 36px;
    background-color: #C0C0C0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #707070;
    font-size: 1.44rem;
    cursor: pointer;
  }
  .main-content {
    flex: 1;
    margin-top: 45px;
    transition: margin-left 0.3s ease-in-out;
    min-height: calc(100vh - 45px);
    display: flex;
    flex-direction: column;
  }
  .main-content.shrunk {
    margin-left: 60px;
  }
  .main-content.expanded {
    margin-left: 200px;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }
  .modal {
    background-color: #ffffff;
    border-radius: 12px;
    width: 500px;
    max-width: 90%;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    animation: modalFadeIn 0.3s ease;
  }
  .modal-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 25px;
    color: #1a202c;
    text-align: center;
    letter-spacing: 0.5px;
  }
  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .label {
    font-size: 1rem;
    font-weight: 500;
    color: #2d3748;
    margin-bottom: 4px;
    letter-spacing: 0.3px;
  }
  .input {
    width: 100%;
    padding: 12px 16px;
    font-size: 1rem;
    font-family: 'Roboto', sans-serif;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    outline: none;
    background-color: #f7fafc;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .input:focus {
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
  .input:disabled {
    background-color: #edf2f7;
    color: #718096;
    cursor: not-allowed;
  }
  .class-code-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .copy-button {
    padding: 10px 20px;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background-color 0.2s ease, transform 0.1s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .copy-button:hover {
    background-color: #2b6cb0;
    transform: translateY(-1px);
  }
  .copy-button:active {
    transform: translateY(0);
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 30px;
  }
  .cancel-button {
    padding: 10px 25px;
    font-size: 1rem;
    font-weight: 500;
    color: #ffffff;
    background-color: #e53e3e;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .cancel-button:hover {
    background-color: #c53030;
    transform: translateY(-1px);
  }
  .cancel-button:active {
    transform: translateY(0);
  }
  .submit-button {
    padding: 10px 25px;
    font-size: 1rem;
    font-weight: 500;
    color: #ffffff;
    background-color: #38a169;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .submit-button:hover {
    background-color: #2f855a;
    transform: translateY(-1px);
  }
  .submit-button:active {
    transform: translateY(0);
  }
  .submit-button:disabled {
    background-color: #cbd5e0;
    cursor: not-allowed;
    transform: none;
  }
  .error-message {
    background-color: #ffebee;
    color: #c62828;
    padding: 10px 15px;
    border-radius: 8px;
    margin: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }
  .close-error-button {
    background: none;
    border: none;
    color: #c62828;
    cursor: pointer;
    font-size: 1rem;
  }
  .loading {
    text-align: center;
    padding: 20px;
    font-size: 1.2rem;
    color: #7f8c8d;
  }
  .logout-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.95);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3000;
  }
  .logout-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #e0e0e0;
    border-top: 5px solid #2ecc71;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .logout-message {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 28px;
    color: #2ecc71;
    font-family: 'Roboto', sans-serif;
    text-align: center;
  }
`;
document.head.appendChild(styleSheet);

export default TeacherDashboard;