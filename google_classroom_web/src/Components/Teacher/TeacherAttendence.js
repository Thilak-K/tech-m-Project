import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft } from "react-icons/fi";
import Papa from "papaparse"; // For CSV generation
import * as XLSX from "xlsx"; // For Excel generation
import { saveAs } from "file-saver"; // For file download

const TeacherAttendance = () => {
  const { classId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};

  // State for attendance-taking
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // State for report generation
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  // State to toggle between sections
  const [activeSection, setActiveSection] = useState("attendance"); // "attendance" or "report"

  const currentDate = new Date("2025-05-14T14:45:00+05:30");
  const formattedCurrentDate = currentDate.toISOString().split("T")[0];
  const isToday = formattedCurrentDate === "2025-05-14";

  // Fetch students and attendance data for the attendance section
  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!classId) {
        setError("Class ID is missing.");
        setLoading(false);
        return;
      }

      if (!userId) {
        setError("User ID is missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        // Fetch students in the class
        const studentsResponse = await axios.get(
          `http://localhost:8080/api/attendance/${classId}/students`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const fetchedStudents = studentsResponse.data || [];
        setStudents(fetchedStudents);

        // Initialize attendance state (default to present for all students)
        const initialAttendance = {};
        fetchedStudents.forEach((student) => {
          if (student.id) {
            initialAttendance[student.id] = true;
          } else {
            console.error("Student missing id:", student);
          }
        });
        setAttendance(initialAttendance);

        // Check if attendance has already been submitted for today
        const attendanceResponse = await axios.get(
          `http://localhost:8080/api/attendance/class/${classId}/date/${formattedCurrentDate}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (attendanceResponse.data && attendanceResponse.data.length > 0) {
          setHasSubmitted(true);
        }
      } catch (err) {
        setError(
          "Failed to fetch data: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [classId, userId, formattedCurrentDate]);

  // Handle checkbox change for attendance
  const handleAttendanceChange = (userId) => {
    setAttendance((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Handle cancel (reset attendance to default)
  const handleCancel = () => {
    const resetAttendance = {};
    students.forEach((student) => {
      if (student.id) {
        resetAttendance[student.id] = true;
      }
    });
    setAttendance(resetAttendance);
    setError("");
  };

  // Handle attendance submission
  const handleSubmitAttendance = async (e) => {
    e.preventDefault();

    if (!isToday) {
      setError("Attendance can only be submitted for today (May 14, 2025).");
      return;
    }

    if (hasSubmitted) {
      setError("Attendance has already been submitted for today.");
      return;
    }

    try {
      const attendanceData = Object.keys(attendance).map((userId) => ({
        userId: userId.trim(),
        present: attendance[userId],
      }));

      const response = await axios.post(
        "http://localhost:8080/api/attendance",
        {
          classId,
          date: formattedCurrentDate,
          attendance: attendanceData,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.message === "Attendance submitted successfully!") {
        setHasSubmitted(true);
        setError("");
        navigate(`/teacher-dashboard`, { state: { userId } });
      } else {
        setError("Failed to submit attendance.");
      }
    } catch (err) {
      setError(
        "Failed to submit attendance: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Handle report generation
  const handleGenerateReport = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setReportError("Please select both start and end dates.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setReportError("Start date cannot be after end date.");
      return;
    }

    if (new Date(endDate) > new Date(formattedCurrentDate)) {
      setReportError("End date cannot be in the future.");
      return;
    }

    setReportLoading(true);
    setReportError("");
    setReportData([]);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/attendance/class/${classId}/range?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const records = response.data.data || [];
      const totalDays = calculateTotalDays(startDate, endDate);

      const report = students.map((student) => {
        const presentDays = records.reduce((count, record) => {
          const attendanceEntry = record.attendance.find(
            (entry) => entry.userId === student.id
          );
          return count + (attendanceEntry && attendanceEntry.present ? 1 : 0);
        }, 0);

        const percentage =
          totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        return {
          name: student.name,
          rollNumber: student.rollNumber,
          attendancePercentage: percentage,
          presentDays,
          totalDays,
        };
      });

      setReportData(report);
    } catch (err) {
      setReportError(
        "Failed to fetch attendance records: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setReportLoading(false);
    }
  };

  // Calculate total days between two dates
  const calculateTotalDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let totalDays = 0;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      totalDays++;
    }

    return totalDays;
  };

  // Download report as CSV using papaparse
  const downloadCSV = () => {
    if (reportData.length === 0) {
      setReportError("No report data to download.");
      return;
    }

    const fields = [
      "name",
      "rollNumber",
      "attendancePercentage",
      "presentDays",
      "totalDays",
      "startDate",
      "endDate",
    ];
    const dataWithDates = reportData.map((record) => ({
      ...record,
      startDate,
      endDate,
    }));

    const csv = Papa.unparse(dataWithDates, { columns: fields });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Attendance_Report_${startDate}_to_${endDate}.csv`);
  };

  // Download report as Excel
  const downloadExcel = () => {
    if (reportData.length === 0) {
      setReportError("No report data to download.");
      return;
    }

    const dataWithDates = reportData.map((record) => ({
      Name: record.name,
      "Roll Number": record.rollNumber,
      "Attendance Percentage (%)": record.attendancePercentage,
      "Present Days": record.presentDays,
      "Total Days": record.totalDays,
      "Start Date": startDate,
      "End Date": endDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataWithDates);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Attendance_Report_${startDate}_to_${endDate}.xlsx`);
  };

  // Color for student cards
  const getCardColor = (index) => {
    const colors = ["#2ecc71", "#3498db", "#f1c40f", "#e74c3c"];
    return colors[index % colors.length];
  };

  // Split students into three columns
  const studentsPerColumn = Math.ceil(students.length / 3);
  const column1 = students.slice(0, studentsPerColumn);
  const column2 = students.slice(studentsPerColumn, studentsPerColumn * 2);
  const column3 = students.slice(studentsPerColumn * 2);

  if (loading) {
    return <div className="loading">Loading data...</div>;
  }

  return (
    <div className="teacher-attendance-container">
      <header className="page-header">
        <button
          onClick={() => navigate("/teacher-dashboard", { state: { userId } })}
          className="back-btn"
        >
          <FiArrowLeft size={20} style={{ marginRight: "8px" }} />
          Back to Dashboard
        </button>
        <h1 className="centered-title">Attendance Management</h1>
      </header>

      {/* Section Toggle Buttons */}
      <div className="section-toggle">
        <button
          className={`toggle-btn ${activeSection === "attendance" ? "active" : ""}`}
          onClick={() => setActiveSection("attendance")}
        >
          Take Attendance
        </button>
        <button
          className={`toggle-btn ${activeSection === "report" ? "active" : ""}`}
          onClick={() => setActiveSection("report")}
        >
          Generate Report
        </button>
      </div>

      {/* Attendance Section */}
      {activeSection === "attendance" && (
        <div className="attendance-list-section">
          {error && <div className="error-banner">{error}</div>}
          {hasSubmitted && (
            <div className="success-banner">
              Attendance has already been submitted for today.
            </div>
          )}
          {!isToday && (
            <div className="error-banner">
              Attendance can only be submitted for today (May 14, 2025).
            </div>
          )}

          <h2 className="section-title">
            Attendance for Class -{" "}
            {currentDate.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </h2>
          {students.length === 0 ? (
            <p className="no-students">No students found in this class.</p>
          ) : (
            <form onSubmit={handleSubmitAttendance} className="attendance-form">
              <div className="student-columns">
                <div className="student-column">
                  {column1.map((student, index) => (
                    <div
                      key={student.id}
                      className="student-card"
                      style={{ borderLeft: `5px solid ${getCardColor(index)}` }}
                    >
                      <div className="student-info">
                        <span className="student-roll">{student.rollNumber}</span>
                        <span className="student-name">{student.name}</span>
                      </div>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={attendance[student.id]}
                          onChange={() => handleAttendanceChange(student.id)}
                          className="checkbox"
                          disabled={hasSubmitted || !isToday}
                        />
                        Present
                      </label>
                    </div>
                  ))}
                </div>
                <div className="student-column">
                  {column2.map((student, index) => (
                    <div
                      key={student.id}
                      className="student-card"
                      style={{
                        borderLeft: `5px solid ${getCardColor(index + column1.length)}`,
                      }}
                    >
                      <div className="card-index">
                        S.No: {index + column1.length + 1}
                      </div>
                      <div className="student-info">
                        <span className="student-roll">{student.rollNumber}</span>
                        <span className="student-name">{student.name}</span>
                      </div>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={attendance[student.id]}
                          onChange={() => handleAttendanceChange(student.id)}
                          className="checkbox"
                          disabled={hasSubmitted || !isToday}
                        />
                        Present
                      </label>
                    </div>
                  ))}
                </div>
                <div className="student-column">
                  {column3.map((student, index) => (
                    <div
                      key={student.id}
                      className="student-card"
                      style={{
                        borderLeft: `5px solid ${getCardColor(
                          index + column1.length + column2.length
                        )}`,
                      }}
                    >
                      <div className="card-index">
                        S.No: {index + column1.length + column2.length + 1}
                      </div>
                      <div className="student-info">
                        <span className="student-roll">{student.rollNumber}</span>
                        <span className="student-name">{student.name}</span>
                      </div>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={attendance[student.id]}
                          onChange={() => handleAttendanceChange(student.id)}
                          className="checkbox"
                          disabled={hasSubmitted || !isToday}
                        />
                        Present
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  style={{ opacity: hasSubmitted || !isToday ? 0.5 : 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  style={{ opacity: hasSubmitted || !isToday ? 0.5 : 1 }}
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Report Section */}
      {activeSection === "report" && (
        <div className="report-section">
          {reportError && <div className="error-banner">{reportError}</div>}

          <div className="report-form-section">
            <h2 className="section-title">Generate Attendance Report</h2>
            <form onSubmit={handleGenerateReport} className="report-form">
              <div className="date-inputs">
                <label className="form-label">
                  <span className="input-label">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={formattedCurrentDate}
                    required
                  />
                </label>
                <label className="form-label">
                  <span className="input-label">End Date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={formattedCurrentDate}
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className="generate-btn"
                disabled={reportLoading}
              >
                {reportLoading ? "Generating..." : "Generate Report"}
              </button>
            </form>
          </div>

          {reportData.length > 0 && (
            <div className="report-results-section">
              <h2 className="section-title">
                Report from {startDate} to {endDate}
              </h2>
              <div className="download-buttons">
                <button onClick={downloadCSV} className="download-btn csv-btn">
                  Download as CSV
                </button>
                <button
                  onClick={downloadExcel}
                  className="download-btn excel-btn"
                >
                  Download as Excel
                </button>
              </div>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll Number</th>
                    <th>Attendance Percentage (%)</th>
                    <th>Present Days</th>
                    <th>Total Days</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((record, index) => (
                    <tr key={index}>
                      <td>{record.name}</td>
                      <td>{record.rollNumber}</td>
                      <td>{record.attendancePercentage}</td>
                      <td>{record.presentDays}</td>
                      <td>{record.totalDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
.teacher-attendance-container {
  padding: 24px 32px;
  background-color: #f4f6f8;
  font-family: 'Roboto', sans-serif;
  color: #202124;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 30px;
}

.back-btn {
  background: none;
  border: none;
  color: #1a73e8;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  position: absolute;
  left: 0;
}

.back-btn:hover {
  color: #1557b0;
}

.centered-title {
  font-size: 34px;
  font-weight: 500;
  margin: 0;
  color: #202124;
  text-align: center;
  width: 100%;
}

/* Section Toggle Styles */
.section-toggle {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.toggle-btn {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  background: #e0e0e0;
  color: #202124;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}

.toggle-btn.active {
  background: #1a73e8;
  color: #ffffff;
}

.toggle-btn:hover {
  background: #d0d0d0;
}

.toggle-btn.active:hover {
  background: #1557b0;
}

/* Attendance Section Styles */
.error-banner {
  background: #fdeded;
  color: #d93025;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.success-banner {
  background: #e6f9e6;
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.attendance-list-section {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: box-shadow 0.3s ease;
  max-width: 1400px;
  margin: 0 auto;
}

.attendance-list-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.section-title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #202124;
  text-align: center;
}

.student-columns {
  display: flex;
  gap: 16px;
  min-height: 50vh;
  overflow-y: auto;
}

.student-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.student-card {
  width: 200px;
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 8px;
  background: #fafafa;
  position: relative;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-index {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #e8f0fe;
  color: #174ea6;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-roll {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}

.student-name {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #202124;
}

.checkbox {
  width: 16px;
  height: 16px;
}

.attendance-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
}

.cancel-btn {
  background: #e74c3c;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease, opacity 0.3s ease;
}

.cancel-btn:hover {
  background: #c0392b;
}

.submit-btn {
  background: #1a73e8;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease, opacity 0.3s ease;
}

.submit-btn:hover {
  background: #1557b0;
}

/* Report Section Styles */
.report-section {
  max-width: 1400px;
  margin: 0 auto;
}

.report-form-section {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 600px;
  margin: 0 auto 30px;
  transition: box-shadow 0.3s ease;
}

.report-form-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.report-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.date-inputs {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
}

.form-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}

.input-label {
  margin-bottom: 6px;
}

.form-label input {
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  background: #f8f9fa;
  transition: border-color 0.2s ease;
}

.form-label input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.generate-btn {
  background: #1a73e8;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.generate-btn:hover {
  background: #1557b0;
}

.generate-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.report-results-section {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  transition: box-shadow 0.3s ease;
}

.report-results-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.download-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.download-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.csv-btn {
  background: #2ecc71;
  color: #ffffff;
}

.csv-btn:hover {
  background: #27ae60;
}

.excel-btn {
  background: #3498db;
  color: #ffffff;
}

.excel-btn:hover {
  background: #2980b9;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #202124;
}

.report-table th,
.report-table td {
  padding: 12px;
  border: 1px solid #e0e0e0;
  text-align: left;
}

.report-table th {
  background: #f8f9fa;
  font-weight: 500;
}

.report-table tbody tr:nth-child(even) {
  background: #fafafa;
}

.report-table tbody tr:hover {
  background: #f1f3f4;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #5f6368;
  font-size: 16px;
}

.no-students {
  text-align: center;
  color: #5f6368;
  font-size: 14px;
  padding: 20px;
  font-style: italic;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .teacher-attendance-container {
    padding: 16px;
  }

  .attendance-list-section {
    min-width: 100%;
  }

  .student-columns {
    flex-direction: column;
    gap: 16px;
  }

  .student-column {
    width: 100%;
  }

  .page-header {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .back-btn {
    position: static;
    margin-bottom: 10px;
  }

  .centered-title {
    margin-top: 0;
  }

  .form-buttons {
    max-width: 100%;
  }

  .section-toggle {
    flex-direction: column;
    gap: 8px;
  }

  .date-inputs {
    flex-direction: column;
    gap: 12px;
  }

  .report-table {
    font-size: 12px;
  }

  .report-table th,
  .report-table td {
    padding: 8px;
  }

  .download-buttons {
    flex-direction: column;
    gap: 8px;
  }
}
`;
document.head.appendChild(styleSheet);

export default TeacherAttendance;