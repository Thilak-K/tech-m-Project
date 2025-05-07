import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const StudentHome = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [homework, setHomework] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  

  const filteredHomework = homework.filter(
    (hw) =>
      hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hw.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={StyleSheet.container}>
      <h1 style={StyleSheet.title}>Welcome to Your Classroom</h1>

      {/* Announcements */}
      <div style={StyleSheet.section}>
        <h2 style={StyleSheet.subtitle}>Announcements</h2>
        {announcements.length === 0 ? (
          <p style={StyleSheet.text}>No announcements available.</p>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} style={StyleSheet.announcement}>
              <h3 style={StyleSheet.announcementTitle}>{ann.title}</h3>
              <p style={StyleSheet.text}>{ann.content}</p>
              <span style={StyleSheet.date}>{ann.date}</span>
            </div>
          ))
        )}
      </div>

      {/* Homework */}
      <div style={StyleSheet.section}>
        <input
          type="text"
          placeholder="Search homework..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={StyleSheet.input}
        />
        <h2 style={StyleSheet.subtitle}>Homework</h2>
        {filteredHomework.length === 0 ? (
          <p style={StyleSheet.text}>No homework found.</p>
        ) : (
          filteredHomework.map((hw) => (
            <div key={hw.id} style={StyleSheet.homeworkItem}>
              <h3 style={StyleSheet.homeworkTitle}>{hw.title}</h3>
              <p style={StyleSheet.text}>{hw.description}</p>
              <p style={StyleSheet.text}>Due: {hw.dueDate}</p>
              <p style={StyleSheet.text}>Status: {hw.status}</p>
              {hw.status !== "Submitted" && hw.status !== "Graded" && (
                <button
                  style={StyleSheet.actionButton}
                  
                >
                  Submit
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StyleSheet = {
  container: { 
    padding: "20px", 
    flex: 1 
  },
  title: { 
    fontSize: "24px", 
    color: "#202124", 
    marginBottom: "20px" 
  },
  subtitle: { 
    fontSize: "18px", 
    color: "#5f6368", 
    marginBottom: "10px" 
  },
  section: { 
    marginBottom: "30px" 
  },
  announcement: {
    padding: "10px",
    borderBottom: "1px solid #dadce0",
    marginBottom: "10px",
  },
  announcementTitle: { 
    fontSize: "16px", 
    fontWeight: "500", 
    color: "#202124" 
  },
  homeworkItem: {
    padding: "10px",
    borderBottom: "1px solid #dadce0",
    marginBottom: "10px",
  },
  homeworkTitle: { 
    fontSize: "16px", 
    fontWeight: "500", 
    color: "#202124" 
  },
  text: { 
    fontSize: "14px",
     color: "#5f6368" 
    },
  date: { 
    fontSize: "12px", 
    color: "#80868b" 
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    marginBottom: "10px",
  },
  actionButton: {
    padding: "8px 16px",
    backgroundColor: "#4285f4",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default StudentHome;
