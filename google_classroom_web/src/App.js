import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Auth imports
import LoginAndSign from "./Components/Authentication/Login&Sign";
import ResetPassword from "./Components/Authentication/ResetPassword";
// Teacher component imports
import TeacherDashboard from "./Components/Teacher/TeacherDashboard";
import TeacherAnnouncement from "./Components/Teacher/TeacherAnnouncement";
import TeacherHomework from "./Components/Teacher/TeacherHomework";
import TeacherSubmission from "./Components/Teacher/TeacherSubmission";
import TeacherAttendance from "./Components/Teacher/TeacherAttendence";

// Student component imports
import StudentDashboard from "./Components/Student/StudentDashboard";
import HomeworkSubmission from "./Components/Student/HomeworkSubmission";


function App() {
  return (
  
    <Router>
      <Routes>
        <Route path="/" element={<LoginAndSign />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard/>} />
        <Route path="/homework/:homeworkId" element={<HomeworkSubmission />} />
        <Route path="/teacher/class/:classId/homework" element={<TeacherHomework />} />
        <Route path="/teacher/class/:classId/submissions" element={<TeacherSubmission />} />
        <Route path="/teacher/class/:classId/announcements" element={<TeacherAnnouncement />} />
        <Route path="/teacher/class/:classId/attendance" element={<TeacherAttendance />} />

      </Routes>
    </Router>
  );
}

export default App;