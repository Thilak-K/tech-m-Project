import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginAndSign from "./Components/Authentication/Login&Sign";
import StudentDashboard from "./Components/Student/StudentDashboard";
import TeacherDashboard from "./Components/Teacher/TeacherDashboard";
import TeacherAnnouncement from "./Components/Teacher/TeacherAnnoucement";
import TeacherHomework from "./Components/Teacher/TeacherHomework";
import TeacherSubmission from "./Components/Teacher/TeacherSubmission";
import TeacherAttendance from "./Components/Teacher/TeacherAttendence";

function App() {
  return (
  
    <Router>
      <Routes>
        <Route path="/" element={<LoginAndSign />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard/>} />
        <Route path="/homework" element={<TeacherHomework />} />
        <Route path="/submissions" element={<TeacherSubmission />} />
        <Route path="/attendance" element={<TeacherAttendance />} />
        <Route path="/announcement" element={<TeacherAnnouncement />} />
      </Routes>
    </Router>
  );
}

export default App;