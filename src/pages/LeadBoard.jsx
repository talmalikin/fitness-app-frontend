import React, { useEffect, useState, useMemo } from "react";
import MobileLayout from "../components/MobileLayout.jsx";

// --- צבעים וסגנונות ---
const THEME = {
  blueDark: "#2d6a4f",
  bluePrimary: "#2962ff",
  bgLight: "#F4F6FA",
  cardWhite: "#FFFFFF",
  textDark: "#1E1E1E",
  textGrey: "#9E9E9E",
  danger: "#52b788",
  buttonBg: "#1b4332",
  rowBg: "#FFFFFF",
  circleBg: "rgba(0, 0, 0, 0.04)",
};

const BRAND_THEME = {
  top3Bg: THEME.blueDark,
  pointsBadge: THEME.danger,
  currentUserBg: THEME.bgLight,
  currentUserBorder: THEME.buttonBg,
  mainBg: THEME.bgLight,
  textDark: THEME.textDark,
  textLight: THEME.cardWhite,
  crownColor: "#FFC72C",
};

const SERVER_URL = "https://fitness-app-backend-52qn.onrender.com";

// 🛑 פונקציית עזר חדשה: המרת מספר צוות לשם תצוגה
const getTeamLabel = (teamNum) => {
  // המרה למספר למקרה שזה מגיע כמחרוזת
  const num = Number(teamNum);
  if (num === 5) return "סגל"; 
  return `צוות ${teamNum ?? "?"}`;
};

// --- פונקציה לצבע לפי שם ---
const getColorForUser = (name) => {
  let hash = 0;
  if (!name) return "#AAAAAA";
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
};

// --- פונקציה לקבלת תצוגת משתמש/קבוצה ---
const getUserDisplayInfo = (user, activeTab) => {
  const isPersonal = activeTab === "personal";

  // חילוץ מספר הצוות בצורה בטוחה
  const teamNum = user.teamNumber || user.team || "?";

  // 🛑 שינוי: שימוש ב-getTeamLabel לתצוגה
  const displayName = isPersonal
    ? user.name || "לא ידוע"
    : getTeamLabel(teamNum);

  const initials = isPersonal
    ? (user.name?.substring(0, 2) ?? "??").toUpperCase()
    : (Number(teamNum) === 5 ? "סגל" : `T${teamNum}`); // איניציאלים מיוחדים לסגל

  const leaderName = user.leadingUserName || user.name || "מוביל לא ידוע";
  const leaderInitials = (leaderName?.substring(0, 2) ?? "??").toUpperCase();
  const leaderInitialBg = getColorForUser(leaderName);

  const initialBg = getColorForUser(displayName);
  const score = user.score ?? user.totalPoints ?? 0;

  return {
    displayName,
    initials,
    initialBg,
    score,
    leaderName,
    leaderInitials,
    leaderInitialBg,
    totalPoints: score,
    teamNum, // מחזירים גם את המספר הנקי לשימוש בקומפוננטות אחרות
  };
};

// --- קומפוננטת TopUserCircle (טופ 3) ---
const TopUserCircle = React.memo(({ user, rank, activeTab }) => {
  const { displayName, score } = getUserDisplayInfo(user, activeTab);
  const isTop = rank === 1;
  const isSecond = rank === 2;
  const size = isTop ? "120px" : "90px";
  const color = isTop ? BRAND_THEME.crownColor : BRAND_THEME.textLight;
  const marginTop = isTop ? "-40px" : "0px";
  const order = isTop ? 2 : isSecond ? 3 : 1;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        textAlign: "center",
        margin: "5px 0",
        backgroundColor: BRAND_THEME.top3Bg,
        border: `3px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
        alignSelf: "flex-end",
        marginTop: marginTop,
        zIndex: isTop ? 10 : 5,
        order: order,
      }}
    >
      <div style={{ fontSize: "20px", marginBottom: "3px", color: color }}>
        {isTop ? "👑" : `#${rank}`}
      </div>
      <div
        style={{
          fontSize: isTop ? "18px" : "14px",
          fontWeight: "bold",
          color: BRAND_THEME.textLight,
        }}
      >
        {displayName}
      </div>
      <div
        style={{
          fontSize: isTop ? "15px" : "12px",
          color: BRAND_THEME.pointsBadge,
          fontWeight: "bold",
        }}
      >
        {score}
      </div>
    </div>
  );
});

// --- קומפוננטת LeaderboardItem (רשימת דירוג) ---
const LeaderboardItem = React.memo(
  ({ item, rank, activeTab, currentUserId, storedUser }) => {
    const { displayName, initials, initialBg, score } = getUserDisplayInfo(
      item,
      activeTab
    );

    const isCurrent =
      activeTab === "personal"
        ? currentUserId && item._id === currentUserId
        : item.teamNumber === storedUser?.teamNumber;

    const isRankOneTeam = activeTab === "group" && rank === 1;

    let itemStyle = {
      backgroundColor: isCurrent ? BRAND_THEME.currentUserBg : THEME.rowBg,
      borderRadius: "12px",
      padding: "10px 15px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      border: isCurrent ? `2px solid ${BRAND_THEME.currentUserBorder}` : "none",
      direction: "ltr",
    };

    if (isRankOneTeam) {
      itemStyle = {
        ...itemStyle,
        padding: "15px 20px",
        border: `2px solid ${BRAND_THEME.crownColor}`,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
        backgroundColor: BRAND_THEME.cardWhite,
      };
    }

    return (
      <div key={item._id || item.teamNumber || rank} style={itemStyle}>
        {/* פרטים: דירוג, תמונה ושם */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "15px",
            flex: 1,
            minWidth: "60%",
          }}
        >
          <span
            style={{
              fontSize: isRankOneTeam ? "18px" : "14px",
              color: isRankOneTeam ? BRAND_THEME.top3Bg : BRAND_THEME.textDark,
              fontWeight: isRankOneTeam ? "bold" : "normal",
              width: "25px",
              textAlign: "left",
              flexShrink: 0,
            }}
          >
            {isRankOneTeam ? "👑" : rank}
          </span>
          <div
            style={{
              width: isRankOneTeam ? "40px" : "36px",
              height: isRankOneTeam ? "40px" : "36px",
              borderRadius: "50%",
              backgroundColor: initialBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: BRAND_THEME.textLight,
              fontSize: "14px",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <span
            style={{
              color: BRAND_THEME.textDark,
              fontWeight: isCurrent || isRankOneTeam ? "bold" : "normal",
              fontSize: isRankOneTeam ? "16px" : "14px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              direction: "rtl",
            }}
          >
            {displayName}{" "}
            {isCurrent
              ? activeTab === "personal"
                ? " (את/ה)"
                : " (הקבוצה שלך)"
              : ""}
          </span>
        </div>

        {/* ניקוד */}
        <div
          style={{
            backgroundColor: isRankOneTeam
              ? BRAND_THEME.crownColor
              : BRAND_THEME.pointsBadge,
            padding: "5px 10px",
            borderRadius: "15px",
            color: isRankOneTeam ? BRAND_THEME.textDark : BRAND_THEME.textLight,
            fontWeight: "bold",
            fontSize: "12px",
            flexShrink: 0,
          }}
        >
          {score}
        </div>
      </div>
    );
  }
);

// --- קומפוננטת SegmentedControl ---
const SegmentedControl = React.memo(({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "personal", label: "דירוג אישי" },
    { key: "group", label: "דירוג קבוצתי" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "0 40px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          backgroundColor: BRAND_THEME.top3Bg,
          borderRadius: "20px",
          border: `1px solid ${BRAND_THEME.textLight}`,
          overflow: "hidden",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: "8px 15px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                border: "none",
                outline: "none",
                backgroundColor: isActive
                  ? BRAND_THEME.textLight
                  : "transparent",
                color: isActive ? BRAND_THEME.top3Bg : BRAND_THEME.textLight,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

// --- קומפוננטת TopTeamSquares ---
const TopTeamSquares = React.memo(({ topUsers }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        marginTop: "10px",
      }}
    >
      {topUsers.map((user, index) => {
        // פירוק המשתנים ושימוש ב-teamNum
        const { leaderName, leaderInitials, leaderInitialBg, totalPoints, teamNum } =
          getUserDisplayInfo(user, "group");

        return (
          <div
            key={user.team || index}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px",
              backgroundColor: BRAND_THEME.cardWhite,
              borderRadius: "10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              border: "none",
              width: "100%",
              height: "60px",
              boxSizing: "border-box",
              direction: "ltr",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: leaderInitialBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: BRAND_THEME.textLight,
                fontSize: "16px",
                fontWeight: "bold",
                flexShrink: 0,
                marginRight: "8px",
              }}
            >
              {leaderInitials}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                flexGrow: 1,
                paddingLeft: "5px",
                justifyContent: "center",
                direction: "rtl",
              }}
            >
              {/* 🛑 תצוגת שם הצוות (סגל או צוות X) */}
              <div
                style={{
                  fontSize: "10px",
                  color: THEME.textGrey,
                  fontWeight: "bold",
                  lineHeight: "1.2",
                }}
              >
                {getTeamLabel(teamNum)}
              </div>

              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "12px",
                  color: BRAND_THEME.textDark,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: "1.2",
                }}
              >
                {leaderName}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: BRAND_THEME.pointsBadge,
                  fontWeight: "bold",
                  lineHeight: "1.2",
                }}
              >
                {totalPoints} נק'
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// --- קומפוננטת LeadBoard ---
export default function LeadBoard() {
  const [users, setUsers] = useState([]);
  const [topUsersPerTeam, setTopUsersPerTeam] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");

  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("user")),
    []
  );
  const currentUserId = storedUser?._id;

  // בדיקת נראות הלידרבורד
  useEffect(() => {
    const checkVisibility = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/settings/visibility`);
        const data = await res.json();
        if (data && typeof data.leaderboardVisible === "boolean") {
          setIsLeaderboardVisible(data.leaderboardVisible);
        } else {
          setIsLeaderboardVisible(false);
        }
      } catch (err) {
        console.error("Failed to check leaderboard visibility:", err);
        setIsLeaderboardVisible(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkVisibility();
  }, []);

  // fetch נתוני הלידרבורד
  useEffect(() => {
    if (!storedUser || !isLeaderboardVisible) return;
    const fetchLeaderboard = async () => {
      try {
        const endpoint =
          activeTab === "personal"
            ? `${SERVER_URL}/leaderboard/personal`
            : `${SERVER_URL}/leaderboard/group`;
        const res = await fetch(endpoint);
        let data = await res.json();

        if (Array.isArray(data)) {
          // מיון הנתונים מהגדול לקטן
          data.sort((a, b) => {
            const scoreA = a.totalPoints ?? a.score ?? 0;
            const scoreB = b.totalPoints ?? b.score ?? 0;
            return scoreB - scoreA;
          });
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setUsers([]);
      }
    };
    fetchLeaderboard();
  }, [activeTab, isLeaderboardVisible, storedUser]);

  // fetch מצטיינים לכל צוות
  useEffect(() => {
    if (!isLeaderboardVisible) return;
    const fetchTopPerTeam = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/users/topusers`);
        const data = await res.json();
        setTopUsersPerTeam(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch top users per team:", err);
        setTopUsersPerTeam([]);
      }
    };
    fetchTopPerTeam();
  }, [isLeaderboardVisible]);

  // לוגיקה לחלוקת התצוגה
  let topDisplay = [];
  let listDisplay = [];

  if (activeTab === "personal") {
    topDisplay = users
      .slice(0, 3)
      .map((user, index) => ({ ...user, rank: index + 1 }));
    listDisplay = users
      .slice(3)
      .map((user, index) => ({ ...user, rank: index + 4 }));
  } else {
    listDisplay = users.map((user, index) => ({ ...user, rank: index + 1 }));
    topDisplay = [];
  }

  const topAreaHeight = activeTab === "group" ? "30px" : "150px";
  const topAreaPaddingBottom = activeTab === "group" ? "10px" : "40px";

  // --- סגנונות ---

  const mainContainerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: BRAND_THEME.mainBg,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const listContainerStyles = {
    flex: 1,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    padding: "0 15px 90px 15px",
  };

  if (isLoading) {
    return (
      <MobileLayout title="טוען..." headerColor={BRAND_THEME.top3Bg}>
        <div style={{ textAlign: "center", padding: "50px", color: BRAND_THEME.textDark }}>
          טוען הגדרות...
        </div>
      </MobileLayout>
    );
  }

  if (!isLeaderboardVisible) {
    return (
      <MobileLayout
        title="דירוג"
        headerColor={BRAND_THEME.top3Bg}
        subtitleColor={BRAND_THEME.textLight}
      >
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
            backgroundColor: BRAND_THEME.mainBg, padding: "20px",
          }}
        >
          <div
            style={{
              width: "100px", height: "100px", borderRadius: "50%",
              backgroundColor: BRAND_THEME.top3Bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "20px", boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)",
            }}
          >
            <span style={{ fontSize: "48px", color: BRAND_THEME.crownColor }}>
              &#128274;
            </span>
          </div>
          <h3 style={{ color: BRAND_THEME.top3Bg, marginBottom: "60px", fontSize: "20px", fontWeight: "bold" }}>
            הדירוג חסום לצפייה
          </h3>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="" subtitle="" headerColor={BRAND_THEME.top3Bg} subtitleColor={BRAND_THEME.textLight}>
      <div style={mainContainerStyle}>
        <div
          style={{
            backgroundColor: BRAND_THEME.top3Bg,
            padding: `40px 0 ${topAreaPaddingBottom} 0`,
            flexShrink: 0,
            position: "relative",
            borderRadius: "0 0 25px 25px",
            transition: "padding 0.3s ease-in-out",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px", color: BRAND_THEME.textLight, fontSize: "18px", textAlign: "center",
              letterSpacing: "2px", fontWeight: "bold", textTransform: "uppercase",
            }}
          >
            LEADERBOARD
          </h3>

          <SegmentedControl activeTab={activeTab} setActiveTab={setActiveTab} />

          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-end",
              padding: "0 15px", height: topAreaHeight, direction: "rtl",
              transition: "height 0.3s ease-in-out",
            }}
          >
            {topDisplay.map((user) => (
              <TopUserCircle
                key={activeTab === "personal" ? user._id || `top-${user.rank}` : user.teamNumber || `top-${user.rank}`}
                user={user}
                rank={user.rank}
                activeTab={activeTab}
              />
            ))}
          </div>
        </div>

        <div style={listContainerStyles}>
          <h3
            style={{
              marginTop: activeTab === "group" ? "10px" : "30px", marginBottom: "10px",
              color: BRAND_THEME.textDark, fontSize: "16px", fontWeight: "bold", textAlign: "right",
              transition: "margin-top 0.3s ease-in-out",
            }}
          >
            דירוג {activeTab === "personal" ? "כללי" : "קבוצות"}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: activeTab === "personal" ? "12px" : "8px" }}>
            {listDisplay.map((item, _) => (
              <LeaderboardItem
                key={activeTab === "personal" ? item._id || `rest-${item.rank}` : item.teamNumber || `rest-${item.rank}`}
                item={item}
                rank={item.rank}
                activeTab={activeTab}
                currentUserId={currentUserId}
                storedUser={storedUser}
              />
            ))}
          </div>

          {activeTab === "group" && topUsersPerTeam.length > 0 && (
            <div style={{ marginTop: "20px", paddingBottom: "30px" }}>
              <h3 style={{ marginBottom: "10px", color: BRAND_THEME.textDark, textAlign: "right", fontWeight: "bold" }}>
                🌟 מצטיינים מכל צוות
              </h3>
              <TopTeamSquares topUsers={topUsersPerTeam} />
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}