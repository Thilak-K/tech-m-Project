import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentHome = ({ userId }) => {
  const [classes, setClasses] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [classToLeave, setClassToLeave] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  // Fetch joined classes and creator names
  useEffect(() => {
    const fetchClassesAndDetails = async () => {
      if (!userId) {
        console.error("User ID is missing.");
        setError("User ID is missing. Please log in again.");
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

        setClasses(joinedClasses);
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
  const handleLeaveClass = async () => {
    if (!classToLeave) return;

    try {
      const response = await axios.post(
        "http://localhost:8080/api/classes/leave",
        {
          classId: classToLeave.classId,
          userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Successfully left the class") {
        setClasses(classes.filter(cls => cls.classId !== classToLeave.classId));
        setError("");
      } else {
        setError("Failed to leave the class. Please try again.");
      }
    } catch (err) {
      console.error("Error leaving class:", err.response?.data || err.message);
      setError("Failed to leave the class: " + (err.response?.data?.message || err.message));
    } finally {
      setShowLeaveConfirm(false);
      setClassToLeave(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getCardColor = (index) => {
    const colors = [
      { start: '#2ecc71', end: '#27ae60' }, // Green
      { start: '#3498db', end: '#2980b9' }, // Blue
      { start: '#f1c40f', end: '#e67e22' }, // Yellow
      { start: '#e74c3c', end: '#c0392b' }, // Red
    ];
    return colors[index % colors.length];
  };

  const handleCardClick = (classId) => {
    navigate(`/student/class/${classId}`, { state: { userId, classId } });
  };

  if (loading) {
    return <div className="loading-text">Loading classes...</div>;
  }

  return (
    <div className="student-home-container">
      <div className="class-grid">
        {error && (
          <div className="error-message">{error}</div>
        )}
        {classes.length === 0 ? (
          <p className="no-classes-text">No classes found. Join a class to get started.</p>
        ) : (
          classes.map((classItem, index) => {
            const cardColor = getCardColor(index);
            return (
              <div
                key={classItem.classId}
                className={`class-card ${hoveredCard === index ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className="card-content"
                  style={{
                    background: `linear-gradient(135deg, ${cardColor.start} 0%, ${cardColor.end} 100%)`,
                  }}
                  onClick={() => handleCardClick(classItem.classId)}
                >
                  <div className="card-header">
                    <h1 className="subject">
                      {classItem.subject} - {classItem.classCode}
                    </h1>
                    <span
                      className="dots"
                      title="Exit Class"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click navigation
                        setClassToLeave(classItem);
                        setShowLeaveConfirm(true);
                      }}
                    >
                      ⋮
                    </span>
                  </div>
                  <div className="section">
                    Section: {classItem.section}
                  </div>
                  <div className="created-info">
                    Created by {userNames[classItem.userId] || 'Loading...'} | {formatDate(classItem.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showLeaveConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Exit</h2>
              <button className="close-button" onClick={() => setShowLeaveConfirm(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to leave the class "{classToLeave?.subject}"?</p>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowLeaveConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="leave-button"
                  onClick={handleLeaveClass}
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
  .student-home-container {
    display: flex;
    justify-content: center;
    padding: 30px;
    background-color: #f7f9fc;
    min-height: 100vh;
    width: 100%;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
  }
  .class-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    max-width: 1200px;
    width: 100%;
    margin-top: 20px;
    box-sizing: border-box;
  }
  .class-card {
    width: 380px;
    height: 200px; /* Adjusted height for a single container */
    border-radius: 12px;
    overflow: hidden;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.3s ease, transform 0.2s ease;
    cursor: pointer; /* Indicate the card is clickable */
  }
  .class-card.hovered {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
  }
  .card-content {
    flex: 1;
    padding: 15px;
    color: #fff;
    border-radius: 12px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .subject {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
    font-family: 'Inter', sans-serif;
  }
  .section {
    font-size: 16px;
    font-weight: 500;
    opacity: 0.9;
    margin-bottom: 10px;
  }
  .created-info {
    font-size: 14px;
    opacity: 0.8;
    margin-top: 10px;
  }
  .dots {
    font-size: 28px;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }
  .dots:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal {
    background-color: #fff;
    border-radius: 15px;
    width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    padding: 20px;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }
  .modal-content {
    padding: 10px 0;
  }
  .modal-content p {
    font-size: 1rem;
    color: #333;
    margin-bottom: 20px;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  .close-button {
    background: none;
    border: none;
    font-size: 30px;
    cursor: pointer;
    color: #333;
    transition: color 0.2s ease;
  }
  .close-button:hover {
    color: #e74c3c;
  }
  .cancel-button {
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    background-color: #3498db;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  .cancel-button:hover {
    background-color: #2980b9;
  }
  .leave-button {
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    background-color: #e74c3c;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  .leave-button:hover {
    background-color: #c0392b;
  }
  .loading-text {
    text-align: center;
    color: #333;
    font-size: 1.1rem;
    font-style: italic;
  }
  .no-classes-text {
    text-align: center;
    color: #333;
    font-size: 1.1rem;
    font-style: italic;
  }
  .error-message {
    color: #e74c3c;
    text-align: center;
    margin-bottom: 20px;
    font-size: 1rem;
    font-weight: 500;
  }
  @media (max-width: 1000px) {
    .class-grid {
      gap: 15px;
      max-width: 900px;
    }
    .class-card {
      width: 320px;
      height: 180px;
    }
    .card-content {
      padding: 12px;
    }
    .subject {
      font-size: 20px;
    }
    .section {
      font-size: 14px;
      margin-bottom: 8px;
    }
    .created-info {
      font-size: 12px;
      margin-top: 8px;
    }
    .dots {
      font-size: 24px;
      padding: 2px 6px;
    }
  }
  @media (max-width: 600px) {
    .class-grid {
      gap: 10px;
      max-width: 100%;
      padding: 0 10px;
    }
    .class-card {
      width: 100%;
      height: 160px;
    }
  }
`;
document.head.appendChild(styleSheet);

export default StudentHome;