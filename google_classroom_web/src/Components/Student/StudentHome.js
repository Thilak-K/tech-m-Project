import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentHome = ({ userId }) => {
  const [classes, setClasses] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState(null); // Track the expanded class
  const [error, setError] = useState(""); // Track errors for leaving class
  const navigate = useNavigate();

  // Fetch joined classes, homework, submissions, and creator names
  useEffect(() => {
    const fetchClassesAndDetails = async () => {
      if (!userId) {
        console.error("User ID is missing.");
        setLoading(false);
        return;
      }

      try {
        // Fetch joined classes
        const response = await axios.get("http://localhost:8080/api/classes", {
          params: { userId, type: "joined" },
          headers: {
            "Content-Type": "application/json",
          },
        });

        const joinedClasses = response.data.data || [];

        // Fetch creator names
        const userIds = [...new Set(joinedClasses.map(cls => cls.userId))];
        const userNamePromises = userIds.map(async (uid) => {
          try {
            const userResponse = await axios.get(`http://localhost:8080/api/auth/users/${uid}`, {
              headers: {
                "Content-Type": "application/json",
              },
            });
            return { userId: uid, name: userResponse.data.name || "Unknown" };
          } catch (err) {
            console.error(`Error fetching user ${uid}:`, err);
            return { userId: uid, name: "Unknown" };
          }
        });

        const userNameResults = await Promise.all(userNamePromises);
        const userNameMap = userNameResults.reduce((acc, { userId, name }) => {
          acc[userId] = name;
          return acc;
        }, {});
        setUserNames(userNameMap);

        // For each class, fetch homework and submissions
        const classesWithDetails = await Promise.all(
          joinedClasses.map(async (cls) => {
            try {
              // Fetch homework for the class
              const homeworkResponse = await axios.get(
                `http://localhost:8080/api/homework/class/${cls.classId}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              const homework = homeworkResponse.data.data || [];

              // Fetch submissions for the class
              const submissionResponse = await axios.get(
                `http://localhost:8080/api/homework/submissions/class/${cls.classId}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              const submissions = submissionResponse.data || [];

              // Fetch student names for each submission
              const submissionsWithStudentNames = await Promise.all(
                submissions.map(async (sub) => {
                  if (!userNameMap[sub.userId]) {
                    try {
                      const studentResponse = await axios.get(
                        `http://localhost:8080/api/auth/users/${sub.userId}`,
                        {
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );
                      userNameMap[sub.userId] = studentResponse.data.name || "Unknown";
                    } catch (err) {
                      console.error(`Error fetching student ${sub.userId}:`, err);
                      userNameMap[sub.userId] = "Unknown";
                    }
                  }
                  return { ...sub, studentName: userNameMap[sub.userId] };
                })
              );

              return {
                ...cls,
                homework,
                submissions: submissionsWithStudentNames,
              };
            } catch (err) {
              console.error(
                `Error fetching details for class ${cls.classId}:`,
                err.response?.data || err.message
              );
              return { ...cls, homework: [], submissions: [] };
            }
          })
        );

        setClasses(classesWithDetails);
      } catch (err) {
        console.error("Failed to fetch classes:", err.message);
        setError("Failed to fetch classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndDetails();
  }, [userId]);

  // Function to handle leaving a class
  const handleLeaveClass = async (classId) => {
    const confirmLeave = window.confirm("Are you sure you want to leave this class?");
    if (!confirmLeave) return;

    try {
      const response = await axios.post(
        "http://localhost:8080/api/classes/leave",
        {
          classId,
          userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Successfully left the class") {
        // Remove the class from the state
        setClasses(classes.filter(cls => cls.classId !== classId));
        setError(""); // Clear any previous errors
        // If the class was expanded, collapse it
        if (expandedClass === classId) {
          setExpandedClass(null);
        }
      } else {
        setError("Failed to leave the class. Please try again.");
      }
    } catch (err) {
      console.error("Error leaving class:", err.response?.data || err.message);
      setError("Failed to leave the class: " + (err.response?.data?.message || err.message));
    }
  };

  // Check if the student has already submitted a homework
  const hasSubmitted = (homeworkId, submissions) => {
    return submissions.some(sub => sub.homeworkId === homeworkId && sub.userId === userId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Toggle the expanded state of a class card
  const toggleExpand = (classId) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  if (loading) {
    return <div style={StyleSheet.loading}>Loading...</div>;
  }

  return (
    <div style={StyleSheet.container}>
      {error && (
        <div style={StyleSheet.errorMessage}>
          {error}
          <button style={StyleSheet.closeErrorButton} onClick={() => setError("")}>
            ✕
          </button>
        </div>
      )}

      {classes.length === 0 ? (
        <p style={StyleSheet.text}>No classes found.</p>
      ) : (
        classes.map((cls) => (
          <div key={cls.classId} style={StyleSheet.classCard}>
            <div style={StyleSheet.classHeader}>
              <div
                style={StyleSheet.classInfo}
                onClick={() => toggleExpand(cls.classId)}
              >
                <h3 style={StyleSheet.sectionTitle}>
                  {cls.subject || "Unnamed Class"} ({cls.classCode || "No Code"})
                </h3>
                <p style={StyleSheet.text}>
                  Section: {cls.section || cls.classCode || "N/A"}
                </p>
                <p style={StyleSheet.text}>
                  Created by {userNames[cls.userId] || "Loading..."} on {formatDate(cls.createdAt)}
                </p>
              </div>
              <div style={StyleSheet.headerActions}>
                <span style={StyleSheet.toggleIcon} onClick={() => toggleExpand(cls.classId)}>
                  {expandedClass === cls.classId ? "−" : "+"}
                </span>
                <button
                  style={StyleSheet.exitButton}
                  onClick={() => handleLeaveClass(cls.classId)}
                >
                  Exit Class
                </button>
              </div>
            </div>
            {expandedClass === cls.classId && (
              <div style={StyleSheet.detailsSection}>
                {/* Homework Section */}
                <div style={StyleSheet.subSection}>
                  <h4 style={StyleSheet.subSectionTitle}>Homework</h4>
                  {cls.homework.length === 0 ? (
                    <p style={StyleSheet.text}>No homework assigned yet.</p>
                  ) : (
                    cls.homework.map((hw) => (
                      <div key={hw.id} style={StyleSheet.homeworkItem}>
                        <h5 style={StyleSheet.homeworkTitle}>{hw.title}</h5>
                        <p style={StyleSheet.text}>{hw.description}</p>
                        <p style={StyleSheet.text}>
                          <strong>Assigned:</strong> {formatDate(hw.assignedDate)}
                        </p>
                        <p style={StyleSheet.text}>
                          <strong>Due:</strong> {formatDate(hw.dueDate)}
                        </p>
                        {hasSubmitted(hw.id, cls.submissions) ? (
                          <p style={StyleSheet.submittedText}>Already Submitted</p>
                        ) : (
                          <button
                            style={StyleSheet.actionButton}
                            onClick={() => navigate(`/homework/${hw.id}`, { state: { userId } })}
                          >
                            View & Submit
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Submissions Section */}
                <div style={StyleSheet.subSection}>
                  <h4 style={StyleSheet.subSectionTitle}>Submissions</h4>
                  {cls.submissions.length === 0 ? (
                    <p style={StyleSheet.text}>No submissions yet.</p>
                  ) : (
                    cls.submissions.map((sub) => (
                      <div key={sub.id} style={StyleSheet.submissionItem}>
                        <p style={StyleSheet.text}>
                          <strong>Student:</strong> {sub.studentName}
                        </p>
                        <p style={StyleSheet.text}>
                          <strong>Google Drive Link:</strong>{" "}
                          {sub.driveLink ? (
                            <a
                              href={sub.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={StyleSheet.link}
                            >
                              View Submission
                            </a>
                          ) : (
                            "Not provided."
                          )}
                        </p>
                        <p style={StyleSheet.text}>
                          <strong>Submitted On:</strong> {formatDate(sub.submittedOn)}
                        </p>
                        <p style={StyleSheet.text}>
                          <strong>Status:</strong> {sub.status}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

// Simple and professional styles without colors
const StyleSheet = {
  container: {
    padding: "24px",
    fontFamily: "'Roboto', sans-serif",
    minHeight: "100vh",
  },
  loading: {
    fontSize: "14px",
    textAlign: "center",
    padding: "16px",
  },
  errorMessage: {
    fontSize: "13px",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeErrorButton: {
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "13px",
  },
  text: {
    fontSize: "13px",
    marginBottom: "4px",
  },
  submittedText: {
    fontSize: "13px",
    fontStyle: "italic",
    marginTop: "8px",
  },
  classCard: {
    marginBottom: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  classHeader: {
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  classInfo: {
    cursor: "pointer",
    flex: 1,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "500",
    margin: "0",
  },
  toggleIcon: {
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  exitButton: {
    padding: "6px 12px",
    border: "1px solid #000",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    background: "none",
  },
  detailsSection: {
    padding: "12px",
    borderTop: "1px solid #ddd",
  },
  subSection: {
    marginBottom: "16px",
  },
  subSectionTitle: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  homeworkItem: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "12px",
  },
  submissionItem: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "12px",
  },
  homeworkTitle: {
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "6px",
  },
  actionButton: {
    padding: "6px 12px",
    border: "1px solid #000",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    background: "none",
  },
  link: {
    textDecoration: "underline",
  },
};

export default StudentHome;