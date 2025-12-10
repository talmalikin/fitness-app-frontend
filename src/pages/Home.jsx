import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

// --- רכיב ManualEntry ---
const ManualEntry = ({ label, onManualAdd, isLoading }) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseInt(amount, 10);
    if (!isNaN(value) && value !== 0) {
      onManualAdd(value);
      setAmount("");
    }
  };

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: THEME.textGrey,
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        הוספה ידנית ל: <span style={{ color: THEME.textDark }}>{label}</span>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "10px", justifyContent: "center" }}
      >
        <input
          type="number"
          placeholder="כמות"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading}
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            width: "80px",
            textAlign: "center",
            fontSize: "16px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !amount}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: isLoading || !amount ? "#ccc" : THEME.buttonBg,
            color: "white",
            fontWeight: "bold",
            cursor: isLoading || !amount ? "not-allowed" : "pointer",
            transition: "background 0.3s",
          }}
        >
          {isLoading ? "..." : "הוסף"}
        </button>
      </form>
    </div>
  );
};

export default function Home() {
  const [logs, setLogs] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedType, setSelectedType] = useState("climb");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // שליפת המשתמש
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;

  // 1. פונקציית טעינת נתונים (useCallback חייב להיות כאן, לפני ה-Return)
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
      ]);

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
  }, [userId]);

  // 2. useEffect חייב להיות כאן
  useEffect(() => {
    if (userId) {
      fetchAndSetAllData();
    }
  }, [fetchAndSetAllData, userId]);

  // 3. handleUpdate חייב להיות כאן
  const handleUpdate = useCallback(
    async (amount) => {
      if (!userId || isLoading) return;
      if (amount < 0 && (logs[selectedType] || 0) <= 0) return;

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
          await fetchAndSetAllData();
        } else {
          const data = await res.json();
          console.error("Server Error:", data.message || res.statusText);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Network error:", err);
        setIsLoading(false);
      }
    },
    [userId, selectedType, logs, isLoading, fetchAndSetAllData]
  );

  const handleAdd = () => handleUpdate(1);
  const handleMinus = () => handleUpdate(-1);

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

  // 🔥 בדיקת אבטחה: העברנו את זה לפה - אחרי שכל ה-Hooks הוגדרו!
  if (!storedUser || !userId) {
    return (
      <MobileLayout title="גישה נדחתה" subtitle="אורח">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              fontSize: "60px",
              marginBottom: "20px",
            }}
          >
            🔒
          </div>
          <h2 style={{ color: THEME.textDark, marginBottom: "10px" }}>
            אינך מחובר למערכת
          </h2>
          <p style={{ color: THEME.textGrey, marginBottom: "30px" }}>
            על מנת לצפות בנתונים ולבצע פעולות, עליך להתחבר לחשבונך
            ב-pakal.online
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "15px 30px",
              backgroundColor: THEME.buttonBg,
              color: "white",
              border: "none",
              borderRadius: "25px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            עבור למסך התחברות
          </button>
        </div>
      </MobileLayout>
    );
  }

  // --- ה-Return הראשי (רק אם המשתמש מחובר) ---
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

        <ManualEntry
          label={getWorkoutLabel(selectedType)}
          onManualAdd={(amount) => handleUpdate(amount)}
          isLoading={isLoading}
        />
      </div>
    </MobileLayout>
  );
}
