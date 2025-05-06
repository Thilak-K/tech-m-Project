import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const StudentCalender = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();
  const currentDate = today.getDate();
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

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setViewDate(new Date(displayYear, displayMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(displayYear, displayMonth + 1, 1));
  };

  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(
      <div key={`empty-${i}`} style={styles.day}>
        <div style={styles.date}></div>
        <div style={styles.taskArea}></div>
      </div>
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === currentDate &&
      displayMonth === today.getMonth() &&
      displayYear === today.getFullYear();
    days.push(
      <div
        key={day}
        style={{
          ...styles.day,
          ...(isToday ? styles.today : {}),
        }}
      >
        <div style={styles.date}>{day}</div>
        <div style={styles.taskArea}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FaChevronLeft style={styles.navIcon} onClick={goToPreviousMonth} />
        <h2 style={styles.month}>
          {monthNames[displayMonth]} {displayYear}
        </h2>
        <FaChevronRight style={styles.navIcon} onClick={goToNextMonth} />
      </div>
      <div style={styles.calendar}>
        {dayNames.map((dayName, index) => (
          <div key={index} style={styles.dayName}>
            {dayName}
          </div>
        ))}

        {days}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#fff",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: 20,
  },
  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
    gap: "15px",
  },
  month: {
    fontSize: "22px",
    fontWeight: "500",
    color: "#202124",
  },
  navIcon: {
    fontSize: "22px",
    color: "#5f6368",
    cursor: "pointer",
  },
  calendar: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "1px",
    backgroundColor: "#dadce0",
    borderRadius: "4px",
    overflow: "hidden",
    minHeight: "calc(100% - 60px)",
  },
  dayName: {
    backgroundColor: "#f1f3f4",
    padding: "10px",
    textAlign: "center",
    fontWeight: "500",
    color: "#5f6368",
    borderBottom: "1px solid #D0D0D0",
  },
  day: {
    backgroundColor: "#fff",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    minHeight: "120px",
    border: "1px solid #D0D0D0",
    boxSizing: "border-box",
  },
  date: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#202124",
    textAlign: "left",
    marginBottom: "10px",
  },
  taskArea: {
    flex: 1,
    backgroundColor: "#fff",
    borderTop: "1px solid #f1f3f4",
    padding: "5px",
  },
  today: {
    backgroundColor: "#e8f0fe",
    border: "1px solid #F0F0F0",
  },
};

export default StudentCalender;
