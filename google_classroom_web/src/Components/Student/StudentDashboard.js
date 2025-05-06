import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaHome, FaCalendar, FaCog, FaSignOutAlt } from "react-icons/fa";
import StudentHome from "./StudentHome";
import StudentCalender from "./StudentCalender";
import StudentSettings from "./StudentSettings";

const StudentDashboard = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState("home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    classCode: "",
  });

  const dropdownRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleItemClick = (item) => {
    if (item === "logout") {
      handleLogout();
    } else {
      setSelectedItem(item);
    }
  };

  const handleLogout = () => {
    // In a real app, you'd clear authentication data (e.g., tokens) and redirect to login
    console.log("User logged out successfully");
    // Example: localStorage.removeItem("authToken");
    // Example redirect (if using React Router): history.push("/login");
    // For now, we'll reset the dashboard state to simulate logout
    setSelectedItem("home");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const openJoinClassModal = () => {
    setIsDropdownOpen(false);
    setIsJoinClassModalOpen(true);
  };

  const closeJoinClassModal = () => {
    setIsJoinClassModalOpen(false);
    setFormData({ ...formData, classCode: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleJoinClass = () => {
    if (formData.classCode.trim()) {
      // In a real app, you'd handle the class joining (e.g., API call)
      console.log(`Joining class with code: ${formData.classCode}`);
      closeJoinClassModal();
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
        return <StudentHome />;
      case "calender":
        return <StudentCalender />;
      case "settings":
        return <StudentSettings />;
      default:
        return <StudentHome />;
    }
  };

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
              ...(selectedItem === "home" ? StyleSheet.sidebarItemSelected : {}),
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
              ...(selectedItem === "calender" ? StyleSheet.sidebarItemSelected : {}),
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
              ...(selectedItem === "settings" ? StyleSheet.sidebarItemSelected : {}),
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
              ...(selectedItem === "logout" ? StyleSheet.sidebarItemSelected : {}),
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
            <span style={StyleSheet.appName}> Student Classroom</span>
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
                  onClick={openJoinClassModal}
                >
                  Join class
                </div>
              </div>
            )}
          </div>

          <div style={StyleSheet.profilecontiner}>
            <div style={StyleSheet.profileIcon}></div>
            <span style={StyleSheet.accountName}>Thilak</span>
          </div>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          marginTop: "45px",
          marginLeft: isSidebarOpen ? "200px" : "60px",
          transition: "margin-left 0.3s ease",
          minHeight: "calc(100vh - 45px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {renderContent()}
      </main>

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
                value={formData.classCode}
                onChange={handleInputChange}
                style={StyleSheet.input}
                placeholder="Enter class code"
                required
              />
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
                disabled={!formData.classCode.trim()}
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
    gap: 2,
    padding: "2px 10px",
  },
  profileIcon: {
    width: "34px",
    height: "34px",
    backgroundColor: "#D3D3D3",
    borderRadius: "50%",
    cursor: "pointer",
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
    width: "400px",
    maxWidth: "90%",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#202124",
    marginBottom: "20px",
  },
  modalContent: {
    marginBottom: "20px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#5f6368",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "80%",
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    outline: "none",
    color: "#202124",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
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
    transition: "background-color 0.2s",
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
    transition: "background-color 0.2s",
  },
};

export default StudentDashboard;