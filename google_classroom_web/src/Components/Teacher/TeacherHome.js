import React from "react";

const TeacherHome = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.message}>Add or Join a class to get started</h2>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
  },
};

export default TeacherHome;