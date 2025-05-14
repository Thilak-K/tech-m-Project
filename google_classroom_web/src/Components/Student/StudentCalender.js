import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentCalendar = ({ userId }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [classes, setClasses] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const today = new Date();
  const displayYear = viewDate.getFullYear();
  const displayMonth = viewDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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
        
        const classesResponse = await axios.get(
          `http://localhost:8080/api/classes?userId=${userId}&type=joined`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const joinedClasses = classesResponse.data.data || [];
        setClasses(joinedClasses);

     
        const allHomework = [];
        for (const cls of joinedClasses) {
          try {
            const homeworkResponse = await axios.get(
              `http://localhost:8080/api/homework/class/${cls.classId}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const homework = homeworkResponse.data.data || [];
            allHomework.push(
              ...homework.map((hw) => ({
                ...hw,
                className: cls.name,
              }))
            );
          } catch (err) {
            console.error(
              `Error fetching homework for class ${cls.classId}:`,
              err.response?.data?.message || err.message
            );
          }
        }

       
        const filteredHomework = allHomework.filter(
          (hw) => new Date(hw.dueDate).getFullYear() === displayYear
        );
        setHomeworkList(filteredHomework);
      } catch (err) {
        setError(
          "Failed to fetch classes and homework: " +
            (err.response?.data?.message || err.message)
        );
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
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
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

      const isOverdue = dueHomework.some(
        (hw) => new Date(hw.dueDate) < new Date() && !isToday
      );

      return (
        <div
          key={index}
          style={{
            ...styles.day,
            ...(isToday ? styles.today : {}),
            ...(dueHomework.length > 0
              ? isOverdue
                ? styles.overdueDay
                : styles.dueDay
              : {}),
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
            {dueHomework.map((hw, hwIndex) => (
              <div
                key={hwIndex}
                style={styles.homework}
                onClick={() => navigate(`/homework/${hw.id}`, { state: { userId } })}
              >
                <span style={styles.className}>{hw.className}: </span>
                <span>{hw.title}</span>
              </div>
            ))}
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
    padding: "20px",
    backgroundColor: "#f5f5f5",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: 20,
    fontFamily: "'Roboto', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
    gap: "15px",
  },
  month: {
    fontSize: "24px",
    fontWeight: "500",
    color: "#202124",
  },
  navIcon: {
    fontSize: "24px",
    color: "#5f6368",
    cursor: "pointer",
  },
  todayButton: {
    padding: "5px 15px",
    border: "1px solid #5f6368",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    color: "#202124",
    fontWeight: "500",
  },
  calendar: {
    display: "flex", 
    flexDirection: "row",
    gap: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    padding: "10px",
    minHeight: "450px",
  },
  day: {
    flex: 1,
    backgroundColor: "#fff",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    minHeight: "300px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box",
  },
  dayHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "10px",
  },
  dayName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#5f6368",
    textAlign: "center",
  },
  date: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#202124",
    textAlign: "center",
    padding: "5px",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  todayDate: {
    backgroundColor: "#1a73e8",
    color: "#fff",
  },
  dueDate: {
    border: "2px solid #fbbc04",
  },
  taskArea: {
    flex: 1,
    backgroundColor: "#fff",
    padding: "5px",
    overflowY: "auto",
  },
  today: {
    border: "2px solid #1a73e8",
  },
  dueDay: {
    border: "2px solid #fbbc04",
  },
  overdueDay: {
    border: "2px solid #d93025",
  },
  homework: {
    fontSize: "14px",
    color: "#202124",
    marginBottom: "8px",
    padding: "8px",
    borderRadius: "4px",
    backgroundColor: "#f9f9f9",
    borderLeft: "4px solid #fbbc04",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  homeworkHover: {
    backgroundColor: "#f1f3f4",
  },
  className: {
    fontWeight: "500",
    color: "#5f6368",
  },
  loading: {
    padding: "20px",
    textAlign: "center",
    color: "#5f6368",
  },
  error: {
    padding: "20px",
    textAlign: "center",
    color: "#d93025",
  },
};

export default StudentCalendar;