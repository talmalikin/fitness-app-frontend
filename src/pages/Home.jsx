import React, { useState, useEffect, useCallback } from "react";
import { THEME, workoutTypes } from "../theme.js";
import MobileLayout from "../components/MobileLayout.jsx";

// מפה לתרגום מפתחות מהשרת (pullups) ל-UI (climb)
const TYPE_MAPPING = {
  pullups: "climb",
  running: "run",
  pushups: "up_down",
};
const SERVER_URL = "https://fitness-app-backend-52qn.onrender.com";

// --- רכיב ActionButton ---
const ActionButton = React.memo(({ onClick, color, label }) => {
  // ... (לוגיקת אנימציה נשארת כפי שהייתה, עטפנו ב-React.memo)
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const scale = isPressed ? 0.9 : isHovered ? 1.1 : 1;
  const opacity = isHovered ? 0.8 : 1;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        border: "none",
        background: color,
        color: "white",
        fontSize: "20px",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        outline: "none",
        transform: `scale(${scale})`,
        opacity: opacity,
        transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      <span style={{ position: "relative", top: label === "−" ? "-1px" : "0" }}>
        {label}
      </span>
    </button>
  );
});

// --- רכיב WorkoutRow ---
const WorkoutRow = React.memo(
  ({ workout, value, isActive, onSelect, onAdd, onMinus }) => (
    <div
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        marginBottom: "10px",
        borderRadius: "30px",
        background: isActive ? "#E3F2FD" : THEME.rowBg,
        border: isActive
          ? `1px solid ${THEME.buttonBg}`
          : "1px solid transparent",
        color: THEME.textDark,
        cursor: "pointer",
        height: "60px",
        fontFamily: "'Arial', sans-serif",
        fontSize: "15px",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ fontWeight: "600" }}>{workout.label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {isActive && (
          <div style={{ display: "flex", gap: "6px" }}>
            <ActionButton onClick={onMinus} color={THEME.danger} label="−" />
            <ActionButton onClick={onAdd} color={THEME.buttonBg} label="+" />
          </div>
        )}

        <span
          style={{
            fontWeight: "bold",
            minWidth: "25px",
            textAlign: "right",
            fontSize: "16px",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  )
);

// --- רכיב DoubleRingProgress ---
const DoubleRingProgress = React.memo(({ points }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      marginBottom: "10px",
      marginTop: "10px",
    }}
  >
    <div
      style={{
        width: "130px",
        height: "130px",
        borderRadius: "50%",
        background: THEME.circleBg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "'Arial', sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "36px",
          fontWeight: "bold",
          color: THEME.textDark,
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {Math.floor(points)}
      </div>

      <div style={{ fontSize: "11px", color: THEME.textGrey }}>
        Total Points
      </div>
    </div>
  </div>
));

export default function Home() {
  const [logs, setLogs] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedType, setSelectedType] = useState("climb");
  const [isLoading, setIsLoading] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id; // 1. פונקציית טעינת נתונים מרכזית (אחראית לסנכרון מלא עם השרת)

  const fetchAndSetAllData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const [workoutsRes, pointsRes] = await Promise.all([
        fetch(`${SERVER_URL}/workout/todayworkout?userId=${userId}`),
        fetch(`${SERVER_URL}/users/points?userId=${userId}`),
      ]);

      const [workoutsData, pointsData] = await Promise.all([
        workoutsRes.json(),
        pointsRes.json(),
      ]); // עדכון לוגים (תוך תרגום המפתחות)

      const exerciseTotals = Object.keys(workoutsData.exercises || {}).reduce(
        (acc, key) => {
          const frontendKey = TYPE_MAPPING[key];
          if (frontendKey) acc[frontendKey] = workoutsData.exercises[key];
          return acc;
        },
        {}
      );
      setLogs(exerciseTotals);
      setTotalPoints(pointsData.totalPoints || 0);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // תלויות: userId // 2. טעינה ראשונית

  useEffect(() => {
    fetchAndSetAllData();
  }, [fetchAndSetAllData]); // 3. פונקציה גנרית לטיפול בעדכון שרת

  const handleUpdate = useCallback(
    async (amount) => {
      if (!userId || isLoading) return;
      if (amount < 0 && (logs[selectedType] || 0) <= 0) return; // 🛑 הוספת isLoading זמני כדי למנוע לחיצות כפולות בזמן שליחת הבקשה

      setIsLoading(true);

      try {
        const res = await fetch(`${SERVER_URL}/workout/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            exercise: selectedType,
            amount: amount,
          }),
        });
        if (res.ok) {
          // לאחר הצלחה, מבצעים טעינה מחדש מלאה כדי לסנכרן את ה-UI
          await fetchAndSetAllData();
        } else {
          const data = await res.json();
          console.error("Server Error:", data.message || res.statusText);
          setIsLoading(false); // במקרה של כישלון, משחררים את ה-Loading
        }
      } catch (err) {
        console.error("Network error:", err);
        setIsLoading(false); // במקרה של כישלון רשת, משחררים
      }
    },
    [userId, selectedType, logs, isLoading, fetchAndSetAllData]
  );

  const handleAdd = () => handleUpdate(1);
  const handleMinus = () => handleUpdate(-1); // 4. עיבוד הנתונים והרנדור

  const getWorkoutLabel = (key) => {
    switch (key) {
      case "climb":
        return "מתח";
      case "up_down":
        return "מקבילים";
      default:
        return workoutTypes.find((t) => t.key === key)?.label || key;
    }
  };

  return (
    <MobileLayout
      title={storedUser ? `${storedUser.name}'s Dashboard` : "Dashboard"}
      subtitle={`האימונים שלך היום `}
    >
      <DoubleRingProgress points={totalPoints} />
      <div style={{ padding: "0 5px" }}>
        {workoutTypes.map((type) => (
          <WorkoutRow
            key={type.key}
            workout={{
              ...type,
              label: getWorkoutLabel(type.key),
            }}
            value={logs[type.key] || 0}
            isActive={selectedType === type.key}
            onSelect={() => setSelectedType(type.key)}
            onAdd={handleAdd}
            onMinus={handleMinus}
          />
        ))}
      </div>
    </MobileLayout>
  );
}
