import React, { useEffect, useState, useMemo } from "react";
import MobileLayout from "../components/MobileLayout.jsx";

// --- אותם צבעים כמו ב-Leaderboard לשמירה על אחידות ---
const THEME = {
  blueDark: "#2d6a4f",
  bgLight: "#F4F6FA",
  cardWhite: "#FFFFFF",
  textDark: "#1E1E1E",
  textGrey: "#9E9E9E",
  danger: "#52b788",
  buttonBg: "#1b4332",
};

const BRAND_THEME = {
  headerBg: THEME.blueDark, // ירוק כהה
  mainBg: THEME.bgLight, // אפור בהיר לרקע
  cardBg: THEME.cardWhite, // לבן לכרטיסים
  textDark: THEME.textDark,
  accent: THEME.danger, // ירוק בהיר להדגשות
};

const SERVER_URL = "https://fitness-app-backend-52qn.onrender.com";

// פונקציה לבחירת הצבע והאייקון בהתאם לשינוי
const getComparisonStyle = (diff) => {
  if (diff > 0) {
    return { color: "#10b981", icon: "▲" }; // ירוק
  }
  if (diff < 0) {
    return { color: "#ef4444", icon: "▼" }; // אדום
  }
  return { color: "#3b82f6", icon: "▬" }; // כחול
};

// --- קומפוננטת כרטיס השוואה ---
const ComparisonCard = ({
  title,
  value,
  diff,
  unit,
  lastDate,
  isRunning = false,
}) => {
  const { color, icon } = getComparisonStyle(diff);

  const diffDisplay = Math.abs(diff).toFixed(isRunning ? 1 : 0);
  const valueDisplay = value.toFixed(isRunning ? 1 : 0);

  const cardStyle = {
    flex: 1,
    minWidth: "28%",
    maxWidth: "110px", // רוחב קומפקטי
    backgroundColor: BRAND_THEME.cardBg,
    borderRadius: "15px",
    padding: "15px 5px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100px",
  };

  if (lastDate === null || diff === null) {
    return (
      <div style={{ ...cardStyle, opacity: 0.7 }}>
        <div
          style={{
            fontSize: "12px",
            color: BRAND_THEME.textDark,
            fontWeight: "bold",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#6b7280" }}>
          -
        </div>
        <div style={{ fontSize: "10px", color: "#9ca3af" }}>--</div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "12px", color: "#4b5563", fontWeight: "600" }}>
        {title}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
        <span
          style={{
            fontSize: "24px",
            fontWeight: "800",
            color: BRAND_THEME.textDark,
          }}
        >
          {valueDisplay}
        </span>
        <span style={{ fontSize: "10px", color: "#6b7280" }}>{unit}</span>
      </div>

      <div
        style={{
          fontSize: "11px",
          color: color,
          fontWeight: "bold",
          backgroundColor: `${color}15`,
          padding: "2px 8px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "3px",
        }}
      >
        <span>{icon}</span>
        <span>{diff !== 0 ? diffDisplay : "-"}</span>
      </div>
    </div>
  );
};

export default function ALL() {
  const [workouts, setWorkouts] = useState([]);
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const comparisonData = useMemo(() => {
    const last = workouts[0] || null;
    const prev = workouts[1] || null;

    if (!last)
      return {
        lastDate: null,
        lastRunning: 0,
        lastPushups: 0,
        lastPullups: 0,
        diffRunning: null,
        diffPushups: null,
        diffPullups: null,
      };
    if (!prev)
      return {
        lastDate: last.date,
        lastRunning: last.running,
        lastPushups: last.pushups,
        lastPullups: last.pullups,
        diffRunning: null,
        diffPushups: null,
        diffPullups: null,
      };

    return {
      lastDate: last.date,
      lastRunning: last.running,
      lastPushups: last.pushups,
      lastPullups: last.pullups,
      diffRunning: last.running - prev.running,
      diffPushups: last.pushups - prev.pushups,
      diffPullups: last.pullups - prev.pullups,
    };
  }, [workouts]);

  useEffect(() => {
    if (!storedUser?._id) return;
    const fetchWorkouts = async () => {
      try {
        const res = await fetch(
          `${SERVER_URL}/workout/user/${storedUser._id}`,
          {
            headers: { Authorization: `Bearer ${storedUser.token || ""}` },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        const mapped = data.map((w) => ({
          date: new Date(w.date).toLocaleDateString("he-IL"),
          pullups: w.exercises.pullups || 0,
          pushups: w.exercises.pushups || 0,
          running: w.exercises.running || 0,
          fullDate: new Date(w.date),
        }));
        setWorkouts(mapped.sort((a, b) => b.fullDate - a.fullDate));
      } catch (err) {
        console.error(err);
      }
    };
    fetchWorkouts();
  }, [storedUser]);

  // --- סגנונות Layout ---

  const mainContainerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BRAND_THEME.mainBg,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 99, // מוודא שזה מעל הכותרת המקורית של MobileLayout
  };

  // 🛑 עיצוב כותרת ירוקה נקייה וקטנה (בלי תמונות/כפתורים)
  const cleanHeaderStyle = {
    backgroundColor: BRAND_THEME.headerBg,
    padding: "40px 0 15px 0", // רווח למעלה (סטטוס בר) ורווח קטן למטה
    textAlign: "center",
    color: "white",
    borderRadius: "0 0 20px 20px", // פינות עגולות למטה
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    flexShrink: 0,
    zIndex: 10,
  };

  const scrollableSectionStyle = {
    flex: 1,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    padding: "0 20px 90px 20px", // רווח למטה לטובת ה-Toolbar
  };

  return (
    <MobileLayout title="" subtitle="">
      {/* עוטף ראשי ב-Fixed שמכסה את כל המסך */}
      <div style={mainContainerStyle}>
        {/* 🛑 חלק עליון: ירוק נקי וקטן */}
        <div style={cleanHeaderStyle}></div>

        {/* תוכן גולל: כרטיסים + טבלה */}
        <div style={scrollableSectionStyle}>
          {/* כרטיסי סטטיסטיקה */}
          <div style={{ marginTop: "20px" }}>
            <h3
              style={{
                margin: "0 0 10px 0",
                color: BRAND_THEME.headerBg,
                fontSize: "16px",
                fontWeight: "bold",
                direction: "rtl",
                textAlign: "right",
              }}
            >
              התקדמות
            </h3>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                alignItems: "center",
                direction: "rtl",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              <ComparisonCard
                title="ריצה"
                value={comparisonData.lastRunning}
                diff={comparisonData.diffRunning}
                unit="ק״מ"
                lastDate={comparisonData.lastDate}
                isRunning={true}
              />
              <ComparisonCard
                title="מקבילים"
                value={comparisonData.lastPushups}
                diff={comparisonData.diffPushups}
                unit="חז'"
                lastDate={comparisonData.lastDate}
              />
              <ComparisonCard
                title="מתח"
                value={comparisonData.lastPullups}
                diff={comparisonData.diffPullups}
                unit="חז'"
                lastDate={comparisonData.lastDate}
              />
            </div>
          </div>

          {/* טבלת יומן אימונים */}
          <div style={{ marginTop: "25px" }}>
            <h3
              style={{
                margin: "0 0 10px 0",
                color: BRAND_THEME.headerBg,
                fontSize: "16px",
                fontWeight: "bold",
                direction: "rtl",
                textAlign: "right",
              }}
            >
              יומן אימונים
            </h3>

            <div style={{ direction: "rtl" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 8px",
                }}
              >
                <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
                  <tr
                    style={{
                      backgroundColor: BRAND_THEME.headerBg,
                      color: "white",
                      borderRadius: "10px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    <th
                      style={{
                        padding: "10px",
                        fontSize: "13px",
                        borderTopRightRadius: "10px",
                        borderBottomRightRadius: "10px",
                      }}
                    >
                      תאריך
                    </th>
                    <th style={{ padding: "10px", fontSize: "13px" }}>מתח</th>
                    <th style={{ padding: "10px", fontSize: "13px" }}>
                      מקבילים
                    </th>
                    <th
                      style={{
                        padding: "10px",
                        fontSize: "13px",
                        borderTopLeftRadius: "10px",
                        borderBottomLeftRadius: "10px",
                      }}
                    >
                      ריצה
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {workouts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#6b7280",
                          backgroundColor: "white",
                          borderRadius: "10px",
                        }}
                      >
                        עדיין אין אימונים להצגה.
                      </td>
                    </tr>
                  ) : (
                    workouts.map((w, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: BRAND_THEME.cardBg,
                          fontSize: "13px",
                          textAlign: "center",
                          height: "45px",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px",
                            fontWeight: "bold",
                            color:
                              index === 0
                                ? BRAND_THEME.accent
                                : BRAND_THEME.textDark,
                            borderTopRightRadius: "10px",
                            borderBottomRightRadius: "10px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          }}
                        >
                          {w.date}
                          {index === 0 && (
                            <span
                              style={{ fontSize: "10px", marginRight: "5px" }}
                            >
                              ✨
                            </span>
                          )}
                        </td>

                        <td style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                          {w.pullups}
                        </td>
                        <td style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                          {w.pushups}
                        </td>

                        <td
                          style={{
                            padding: "8px",
                            borderTopLeftRadius: "10px",
                            borderBottomLeftRadius: "10px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          }}
                        >
                          {w.running}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
