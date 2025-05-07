import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginAndSign from "./Components/Authentication/Login&Sign";
import StudentDashboard from "./Components/Student/StudentDashboard";
import TeacherDashboard from "./Components/Teacher/TeacherDashboard";



function App() {
  return (
    <StudentDashboard />
    
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<LoginAndSign />} />
    //     <Route path="/student-dashboard" element={<StudentDashboard />} />
    //     <Route path="/teacher-dashboard" element={<StudentDashboard />} />
    //   </Routes>
    // </Router>
  );
}

export default App;