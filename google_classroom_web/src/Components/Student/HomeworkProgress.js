import React, { useEffect, useState } from "react";
import axios from "axios";

const HomeworkProgress = () => {
  const [homework, setHomework] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/homework").then((res) => setHomework(res.data));
  }, []);

  return (
    <div style={StyleSheet.container}>
      <h1 style={StyleSheet.title}>Homework Progress</h1>
      <div style={StyleSheet.section}>
        {homework.length === 0 ? (
          <p style={StyleSheet.text}>No homework assigned.</p>
        ) : (
          homework.map((hw) => (
            <div key={hw.id} style={StyleSheet.homeworkItem}>
              <h3 style={StyleSheet.homeworkTitle}>{hw.title}</h3>
              <p style={StyleSheet.text}>{hw.description}</p>
              <p style={StyleSheet.text}>Due: {hw.dueDate}</p>
              <p style={StyleSheet.text}>Status: {hw.status}</p>
              <p style={StyleSheet.text}>Grade: {hw.grade ? `${hw.grade}/${hw.maxPoints}` : "Not Graded"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StyleSheet = {
  container: { padding: "20px", flex: 1 },
  title: { fontSize: "24px", color: "#202124", marginBottom: "20px" },
  section: { marginBottom: "30px" },
  homeworkItem: { padding: "10px", borderBottom: "1px solid #dadce0", marginBottom: "10px" },
  homeworkTitle: { fontSize: "16px", fontWeight: "500", color: "#202124" },
  text: { fontSize: "14px", color: "#5f6368" },
};

export default HomeworkProgress;