import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";

const TeacherCalendar = ({ userId }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [classes, setClasses] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date("2025-05-14T16:00:00+05:30"); // Updated to match the current date and time (04:00 PM IST)
  const displayYear = viewDate.getFullYear();
  const displayMonth = viewDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const startOfWeek = new Date(viewDate);
  const dayOfWeek = startOfWeek.getDay();
  const daysFromMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  startOfWeek.setDate(viewDate.getDate() - daysFromMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    days.push(currentDay);
  }

  useEffect(() => {
    const fetchClassesAndHomework = async () => {
      setLoading(true);
      setError("");
      try {
        const createdResponse = await axios.get(
          `http://localhost:8080/api/classes?userId=${userId}&type=created`
        );
        const joinedResponse = await axios.get(
          `http://localhost:8080/api/classes?userId=${userId}&type=joined`
        );

        const createdClasses = createdResponse.data.data || [];
        const joinedClasses = joinedResponse.data.data || [];
        const allClasses = [...createdClasses, ...joinedClasses];
        setClasses(allClasses);

        const allHomework = [];
        for (const cls of allClasses) {
          try {
            const homeworkResponse = await axios.get(
              `http://localhost:8080/api/homework/class/${cls.classId}`
            );
            const homework = homeworkResponse.data.data || [];
            allHomework.push(
              ...homework.map((hw) => ({
                ...hw,
                classSubject: cls.subject,
              }))
            );
          } catch (err) {
            console.error(`Error fetching homework for class ${cls.classId}:`, err);
          }
        }

        const filteredHomework = allHomework.filter(
          (hw) => new Date(hw.dueDate).getFullYear() === displayYear
        );
        setHomeworkList(filteredHomework);
      } catch (err) {
        setError("Failed to fetch classes and homework: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndHomework();
  }, [userId, displayYear]);

  const goToPreviousWeek = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() - 7);
    setViewDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() + 7);
    setViewDate(newDate);
  };

  const goToToday = () => {
    setViewDate(new Date());
  };

  const formatDateForComparison = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const renderDays = () => {
    return days.map((day, index) => {
      const isToday =
        day.getDate() === today.getDate() &&
        day.getMonth() === today.getMonth() &&
        day.getFullYear() === today.getFullYear();

      const dueHomework = homeworkList.filter((hw) => {
        const dueDate = new Date(hw.dueDate);
        return formatDateForComparison(dueDate) === formatDateForComparison(day);
      });

      return (
        <div
          key={index}
          style={{
            ...styles.day,
            ...(isToday ? styles.today : {}),
          }}
        >
          <div style={styles.dayHeader}>
            <div style={styles.dayName}>{dayNames[index]}</div>
            <div
              style={{
                ...styles.date,
                ...(isToday ? styles.todayDate : {}),
                ...(dueHomework.length > 0 ? styles.dueDate : {}),
              }}
            >
              {day.getDate()}
            </div>
          </div>
          <div style={styles.taskArea}>
            {dueHomework.map((hw, hwIndex) => {
              const dueDate = new Date(hw.dueDate);
              const isDueToday = formatDateForComparison(dueDate) === formatDateForComparison(today);

              return (
                <div
                  key={hwIndex}
                  style={{
                    ...styles.homework,
                    ...(isDueToday ? styles.homeworkDueToday : {}),
                  }}
                >
                  <span style={styles.className}>{hw.classSubject}: </span>
                  <span
                    style={{
                      ...styles.homeworkTitle,
                      ...(isDueToday ? styles.homeworkTitleDueToday : {}),
                    }}
                  >
                    {hw.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FaChevronLeft style={styles.navIcon} onClick={goToPreviousWeek} />
        <h2 style={styles.month}>
          {monthNames[displayMonth]} {displayYear}
        </h2>
        <button style={styles.todayButton} onClick={goToToday}>
          Today
        </button>
        <FaChevronRight style={styles.navIcon} onClick={goToNextWeek} />
      </div>
      <div style={styles.calendar}>{renderDays()}</div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#f5f6fa",
    minHeight: "100vh",
    boxSizing: "border-box",
    fontFamily: "'Roboto', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "30px",
    gap: "20px",
    backgroundColor: "#ffffff",
    padding: "15px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  month: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#2c3e50",
    letterSpacing: "0.5px",
  },
  navIcon: {
    fontSize: "26px",
    color: "#34495e",
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  todayButton: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#3498db",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    boxShadow: "0 2px 8px rgba(52, 152, 219, 0.3)",
  },
  calendar: {
    display: "flex",
    flexDirection: "row",
    gap: "15px",
    backgroundColor: "#f5f6fa",
    borderRadius: "12px",
    padding: "15px",
    minHeight: "500px",
  },
  day: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    minHeight: "400px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box",
    transition: "transform 0.2s ease",
    border: "2px solid #e0e0e0", 
  },
  dayHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "15px",
  },
  dayName: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: "5px",
  },
  date: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
    padding: "8px",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f3f4",
  },
  todayDate: {
    backgroundColor: "#3498db",
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(52, 152, 219, 0.4)",
  },
  dueDate: {
    border: "2px solid #7f8c8d", // Neutral gray border for the date circle
    backgroundColor: "#ffffff",
  },
  taskArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: "10px",
    overflowY: "auto",
    borderTop: "1px solid #e0e0e0",
  },
  today: {
    border: "2px solid #3498db", // Blue border for today
  },
  homework: {
    fontSize: "14px",
    color: "#2c3e50",
    marginBottom: "12px",
    padding: "10px",
    borderRadius: "6px",
    backgroundColor: "#fefefe",
    borderLeft: "4px solid #e0e0e0",
    transition: "background-color 0.2s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  homeworkDueToday: {
    borderLeft: "4px solid #e74c3c",
  },
  className: {
    fontWeight: "500",
    color: "#7f8c8d",
    marginRight: "5px",
  },
  homeworkTitle: {
    fontWeight: "500",
    color: "#2c3e50",
    display: "block",
    marginBottom: "4px",
  },
  homeworkTitleDueToday: {
    color: "#e74c3c",
  },
  dueDateText: {
    fontSize: "12px",
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  dueDateTextDueToday: {
    color: "#e74c3c",
  },
  loading: {
    padding: "30px",
    textAlign: "center",
    color: "#7f8c8d",
    fontSize: "18px",
    fontStyle: "italic",
  },
  error: {
    padding: "30px",
    textAlign: "center",
    color: "#e74c3c",
    fontSize: "18px",
    fontWeight: "500",
  },
};

export default TeacherCalendar;