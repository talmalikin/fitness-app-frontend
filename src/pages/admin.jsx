import React, { useEffect, useState } from "react";
// ודא שאתה מייבא את MobileLayout כראוי אם הוא נחוץ
// import MobileLayout from "../components/MobileLayout.jsx";

// --- צבעים וסגנונות (ללא שינוי) ---
const THEME = {
  blueDark: "#E53935",
  bgLight: "#F4F6FA",
  cardWhite: "#FFFFFF",
  textDark: "#1E1E1E",
  danger: "#E53935",
  buttonBg: "#1b4332",
  rowBg: "#FFFFFF",
  redDanger: "#E53935",
  grayOff: "#E0E0E0",
  thumbGray: "#F0F0F0",
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

// --- פונקציות עזר ---

// 🛑 פונקציית עזר חדשה: המרת מספר צוות לשם תצוגה
const getTeamLabel = (teamNum) => {
  const num = Number(teamNum);
  if (num === 5) return "סגל";
  return `צוות ${teamNum ?? "?"}`;
};

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

const getUserDisplayInfo = (user, activeTab) => {
  const isPersonal = activeTab === "personal";

  // חילוץ מספר הצוות
  const teamNum = user.teamNumber || user.team || "?";

  // 🛑 שינוי: שימוש ב-getTeamLabel
  const displayName = isPersonal
    ? user.name || "לא ידוע"
    : getTeamLabel(teamNum);

  const initials = isPersonal
    ? (user.name?.substring(0, 2) ?? "??").toUpperCase()
    : (Number(teamNum) === 5 ? "סגל" : `T${teamNum}`); // איניציאלים לסגל

  const leaderName = user.leadingUserName || user.name || "מוביל לא ידוע";
  const initialBg = getColorForUser(displayName);
  const score = user.score ?? user.totalPoints ?? 0;

  return {
    displayName,
    initials,
    initialBg,
    score,
    leaderName: leaderName,
    leaderInitials: (leaderName?.substring(0, 2) ?? "??").toUpperCase(),
    leaderInitialBg: getColorForUser(leaderName),
    totalPoints: score,
    teamNum, // מחזירים גם את המספר הנקי
  };
};

// --- קומפוננטת TopUserCircle (ללא שינוי) ---
const TopUserCircle = ({ user, rank, activeTab }) => {
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
        zIndex: 10,
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
};

// --- קומפוננטת LeaderboardItem (ללא שינוי) ---
const LeaderboardItem = ({
  item,
  rank,
  activeTab,
  currentUserId,
  storedUser,
}) => {
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
    flexShrink: 0,
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
      {/* 1. הפרטים: דירוג, תמונה ושם (צד שמאל) */}
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

      {/* 2. הניקוד (צד ימין רחוק) */}
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
};

// --- קומפוננטת TopTeamSquares ---
const TopTeamSquares = ({ topUsers, style }) => {
  const displayUsers = topUsers;

  return (
    <div style={style}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        {displayUsers.map((user, index) => {
          // 🛑 שליפה גם של teamNum
          const { leaderName, leaderInitials, leaderInitialBg, teamNum } =
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
                flexShrink: 0,
                direction: "ltr",
              }}
            >
              {/* צד שמאל: איניציאלים */}
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

              {/* צד ימין: שם המוביל ושם הצוות/ניקוד */}
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
                {/* 🛑 הוספנו: תצוגת שם הצוות (סגל/צוות X) */}
                <div
                  style={{
                    fontSize: "10px",
                    color: THEME.textDark, // או צבע אפור כהה
                    fontWeight: "bold",
                    lineHeight: "1.2",
                    opacity: 0.7,
                  }}
                >
                  {getTeamLabel(teamNum)}
                </div>

                {/* שם המוביל */}
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

                {/* נקודות */}
                <div
                  style={{
                    fontSize: "11px",
                    color: BRAND_THEME.pointsBadge,
                    fontWeight: "bold",
                    lineHeight: "1.2",
                  }}
                >
                  {user.totalPoints} נק'
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- קומפוננטת ToggleSwitch (ללא שינוי) ---
const ToggleSwitch = ({ isVisible, onToggle }) => {
  const colorOn = BRAND_THEME.pointsBadge;
  const colorOffTrack = THEME.grayOff;
  const colorThumb = THEME.thumbGray;

  const trackStyle = {
    width: "60px",
    height: "30px",
    borderRadius: "15px",
    backgroundColor: isVisible ? colorOn : colorOffTrack,
    transition: "background-color 0.3s",
    position: "relative",
    cursor: "pointer",
    flexShrink: 0,
  };

  const thumbStyle = {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    backgroundColor: colorThumb,
    position: "absolute",
    top: "2px",
    left: isVisible ? "32px" : "2px",
    transition: "left 0.3s",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
    zIndex: 10,
  };

  const textBaseStyle = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "12px",
    fontWeight: "bold",
    transition: "opacity 0.3s",
    lineHeight: "1",
  };

  const textOnStyle = {
    ...textBaseStyle,
    right: "8px",
    color: THEME.cardWhite,
    opacity: isVisible ? 1 : 0,
  };

  const textOffStyle = {
    ...textBaseStyle,
    left: "8px",
    color: BRAND_THEME.textDark,
    opacity: isVisible ? 0 : 1,
  };

  const toggleContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    direction: "rtl",
    width: "100%",
    maxWidth: "350px",
    padding: "10px 15px",
    backgroundColor: BRAND_THEME.cardWhite,
    borderRadius: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: isVisible ? "none" : `1px solid ${THEME.redDanger}`,
  };

  return (
    <div style={toggleContainerStyle}>
      <span style={{ fontWeight: "bold", color: BRAND_THEME.textDark }}>
        הצג למשתמשים:
      </span>
      <div onClick={onToggle} style={trackStyle}>
        <span style={textOnStyle}>ON</span>
        <span style={textOffStyle}>OFF</span>
        <div style={thumbStyle} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------
// --- קומפוננטת הניהול הראשית (Admin.jsx) ---
// ---------------------------------------------------------------------

export default function AdminPage() {
  const [personalUsers, setPersonalUsers] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [topUsersPerTeam, setTopUsersPerTeam] = useState([]);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = storedUser?._id;

  // פונקציית המיתוג: שולחת PATCH לשרת
  const handleToggle = async () => {
    try {
      const endpoint = `${SERVER_URL}/settings/toggle`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (typeof data.leaderboardVisible === "boolean") {
        setIsLeaderboardVisible(data.leaderboardVisible);
      } else {
        console.error("Backend response invalid:", data);
      }
    } catch (err) {
      console.error(`Failed to toggle leaderboard visibility:`, err);
      alert(
        "שגיאה: לא ניתן היה לשנות את מצב הדירוג בשרת. בדוק את חיבור הרשת."
      );
    }
  };

  // 🛠 תיקון ESLint: כל הלוגיקה האסינכרונית עטופה בפונקציה
  useEffect(() => {
    let isMounted = true;

    const fetchData = async (endpoint) => {
      const res = await fetch(`${SERVER_URL}/${endpoint}`);
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
      const data = await res.json();
      return data;
    };

    const loadAllData = async () => {
      const promises = [
        fetchData("settings/visibility"),
        fetchData("leaderboard/personal"),
        fetchData("leaderboard/group"),
        fetchData("users/topusers"),
      ];

      try {
        const [visibilityData, personalData, groupData, topUsersData] =
          await Promise.all(promises);

        if (isMounted) {
          if (typeof visibilityData?.leaderboardVisible === "boolean") {
            setIsLeaderboardVisible(visibilityData.leaderboardVisible);
          }

          // 🛑 תיקון: מיון (Sort) הנתונים האישיים לפי ניקוד
          if (Array.isArray(personalData)) {
            personalData.sort((a, b) => {
              const scoreA = a.totalPoints ?? a.score ?? 0;
              const scoreB = b.totalPoints ?? b.score ?? 0;
              return scoreB - scoreA;
            });
            setPersonalUsers(personalData);
          } else {
            setPersonalUsers([]);
          }

          // 🛑 תיקון: מיון (Sort) הנתונים הקבוצתיים לפי ניקוד
          if (Array.isArray(groupData)) {
            groupData.sort((a, b) => {
              const scoreA = a.totalPoints ?? a.score ?? 0;
              const scoreB = b.totalPoints ?? b.score ?? 0;
              return scoreB - scoreA;
            });
            setGroupUsers(groupData);
          } else {
            setGroupUsers([]);
          }

          setTopUsersPerTeam(Array.isArray(topUsersData) ? topUsersData : []);
        }
      } catch (err) {
        console.error("Failed to load all data:", err);
      } finally {
        if (isMounted) {
          setIsInitialLoad(false);
        }
      }
    };

    loadAllData();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- לוגיקת תצוגה והפרדה ---

  const personalTopDisplay = personalUsers
    .slice(0, 3)
    .map((user, index) => ({ ...user, rank: index + 1 }));
  const personalListDisplay = personalUsers
    .slice(3)
    .map((user, index) => ({ ...user, rank: index + 4 }));
  const groupListDisplay = groupUsers.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));

  const innerScrollStyles = {
    maxHeight: "300px",
    overflowY: "scroll",
    paddingRight: "5px",
    WebkitOverflowScrolling: "touch",
  };
  const topTeamsScrollStyles = {
    maxHeight: "220px",
    overflowY: "scroll",
    paddingRight: "5px",
    WebkitOverflowScrolling: "touch",
  };
  const scrollableClassName = "hide-scrollbar";
  const mainContainerPaddingBottom = "100px";

  // 🛑 תצוגת טעינה ראשונית
  if (isInitialLoad) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: BRAND_THEME.mainBg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h3 style={{ color: BRAND_THEME.textDark }}>טוען נתונים...</h3>
      </div>
    );
  }

  // 🛑 תצוגת הדירוג המלאה (עמוד ניהול)
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        minHeight: "100vh",
        backgroundColor: BRAND_THEME.mainBg,
        padding: 0,
        margin: 0,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          backgroundColor: BRAND_THEME.mainBg,
          minHeight: "100vh",
          paddingBottom: mainContainerPaddingBottom,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* טופ 3 אישי / אזור רקע ירוק */}
        <div
          style={{
            backgroundColor: BRAND_THEME.top3Bg,
            padding: "10px 0 40px 0",
            position: "relative",
            borderRadius: "0 0 25px 25px",
            marginBottom: "10px",
          }}
        >
          <h2
            style={{
              margin: "40px 0 10px",
              color: BRAND_THEME.textLight,
              fontSize: "24px",
              textAlign: "center",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          >
            LEADERBOARD ADMIN
          </h2>
          <h3
            style={{
              margin: "0 0 20px",
              color: BRAND_THEME.crownColor,
              fontSize: "18px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            דירוג אישי - טופ 3
          </h3>

          {/* מיקום ה-Top 3 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "flex-end",
              padding: "0 10px",
              height: "150px",
              direction: "rtl",
              width: "100%",
            }}
          >
            {personalTopDisplay.map((user) => (
              <TopUserCircle
                key={user._id || `top-${user.rank}`}
                user={user}
                rank={user.rank}
                activeTab={"personal"}
              />
            ))}
          </div>
        </div>

        {/* אזור תוכן לבן / רשימות דירוג */}
        <div style={{ margin: "0 15px" }}>
          {/* דירוג אישי כללי */}
          <h3
            style={{
              marginTop: "30px",
              marginBottom: "15px",
              color: BRAND_THEME.textDark,
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "right",
              borderBottom: `2px solid ${BRAND_THEME.pointsBadge}`,
              paddingBottom: "5px",
            }}
          >
            🚶 דירוג אישי מלא
          </h3>
          <div
            className={scrollableClassName}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              ...innerScrollStyles,
            }}
          >
            {personalListDisplay.map((item) => (
              <LeaderboardItem
                key={item._id || `rest-${item.rank}`}
                item={item}
                rank={item.rank}
                activeTab={"personal"}
                currentUserId={currentUserId}
                storedUser={storedUser}
              />
            ))}
          </div>

          {/* דירוג קבוצות */}
          <h3
            style={{
              marginTop: "40px",
              marginBottom: "15px",
              color: BRAND_THEME.textDark,
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "right",
              borderBottom: `2px solid ${BRAND_THEME.pointsBadge}`,
              paddingBottom: "5px",
            }}
          >
            🏆 דירוג קבוצתי
          </h3>
          <div
            className={scrollableClassName}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              ...innerScrollStyles,
            }}
          >
            {groupListDisplay.map((item) => (
              <LeaderboardItem
                key={item.teamNumber || `group-rest-${item.rank}`}
                item={item}
                rank={item.rank}
                activeTab={"group"}
                currentUserId={currentUserId}
                storedUser={storedUser}
              />
            ))}
          </div>

          {/* מצטיינים מכל צוות */}
          {topUsersPerTeam.length > 0 && (
            <div style={{ marginTop: "40px", marginBottom: "30px" }}>
              <h3
                style={{
                  marginBottom: "10px",
                  color: BRAND_THEME.textDark,
                  textAlign: "right",
                  fontWeight: "bold",
                  borderBottom: `2px solid ${BRAND_THEME.pointsBadge}`,
                  paddingBottom: "5px",
                }}
              >
                🌟 מצטיינים מכל צוות
              </h3>
              <div className={scrollableClassName} style={topTeamsScrollStyles}>
                <TopTeamSquares topUsers={topUsersPerTeam} style={{}} />
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            position: "fixed",
            bottom: "0",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            width: "100%",
            boxSizing: "border-box",
            zIndex: 1000,

            backgroundColor: THEME.cardWhite,
            padding: "10px 0 20px 0",
            boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ToggleSwitch
            isVisible={isLeaderboardVisible}
            onToggle={handleToggle}
          />
        </div>
      </div>
    </div>
  );
}