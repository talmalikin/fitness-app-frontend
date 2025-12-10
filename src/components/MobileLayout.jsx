import React, { useState } from "react";
import { THEME } from "../theme.js";
import { useNavigate } from "react-router-dom";

// 🛑 ודא שהנתיבים האלה נכונים לפרויקט שלך
import userPhoto from "../../photos/photo.png";
import animationImage from "../../photos/animation.png";

// --- קומפוננטת התוכן (ImageAnimationContent) ---
const ImageAnimationContent = ({ onClose }) => {
  const [rotation, setRotation] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 15) % 360);
    }, 100);

    const closeTimer = setTimeout(() => {
      clearInterval(interval);
      onClose();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(closeTimer);
    };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        cursor: "pointer",
        transition: "opacity 0.3s ease",
        opacity: 1,
      }}
    >
      <img
        src={animationImage}
        alt="Awesome Animation"
        style={{
          maxWidth: "80%",
          maxHeight: "80%",
          objectFit: "contain",
          borderRadius: "15px",
          transform: `scale(1.2) rotate(${rotation}deg)`,
          transition: "transform 0.1s linear",
        }}
      />
    </div>
  );
};

// --- קומפוננטת העטיפה (ImageAnimation) ---
const ImageAnimation = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  return <ImageAnimationContent onClose={onClose} />;
};

// --- התפריט התחתון (BottomNav) ---
const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed", // שיניתי ל-fixed כדי שיישאר דבוק למטה תמיד
        bottom: 0,
        left: 0,
        width: "100%",
        height: "70px",
        background: THEME.blueDark,
        // הסרתי את borderTopLeftRadius/RightRadius כדי שזה יהיה פס ישר
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 40px",
        boxSizing: "border-box",
        zIndex: 100, // Z-index גבוה כדי שיהיה מעל התוכן
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)", // הוספתי צל קטן להפרדה
      }}
    >
      {/* Schedule → ALL */}
      <div
        onClick={() => navigate("/all")}
        style={{
          color: "#fff",
          textAlign: "center",
          opacity: 0.7,
          cursor: "pointer",
        }}
      >
        <div style={{ fontSize: "18px" }}>📅</div>
        <span style={{ fontSize: "10px" }}>All Activity</span>
      </div>

      {/* Center ⚡ */}
      <div
        onClick={() => navigate("/home")}
        style={{
          width: "50px",
          height: "50px",
          background: THEME.buttonBg,
          borderRadius: "50%",
          marginTop: "-35px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "20px",
          color: "white",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
        }}
      >
        ⚡
      </div>

      {/* Activity → LeaderBoard */}
      <div
        onClick={() => navigate("/leaderboard")}
        style={{
          color: "#fff",
          textAlign: "center",
          opacity: 0.7,
          cursor: "pointer",
        }}
      >
        <div style={{ fontSize: "18px" }}>🏆</div>
        <span style={{ fontSize: "10px" }}> Leaders</span>
      </div>
    </div>
  );
};

// --- הקומפוננטה שעוטפת את העמוד ---
const MobileLayout = ({ children, title = "Dashboard", subtitle = "" }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handlePhotoClick = () => {
    setShowAnimation(true);
  };
  const handleCloseAnimation = () => {
    setShowAnimation(false);
  };

  const displayTitle = storedUser ? `${storedUser.name}'s Dashboard` : title;

  return (
    <div
      style={{
        // שינוי: מסך מלא ללא שוליים וללא רקע אפור
        height: "100vh",
        width: "100vw",
        background: THEME.cardWhite, // רקע לבן בסיסי
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // מונע גלילה כפולה של הדפדפן
        padding: 0, // הסרנו padding חיצוני
      }}
    >
      {/* קומפוננטת האנימציה */}
      <ImageAnimation
        isVisible={showAnimation}
        onClose={handleCloseAnimation}
      />

      {/* אזור הכותרת (Header) */}
      <div
        style={{
          background: THEME.blueDark,
          padding: "30px 24px 50px 24px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexShrink: 0, // מונע כיווץ של ה-Header
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            {displayTitle}
          </h1>
          {subtitle && (
            <p style={{ margin: "4px 0 0 0", opacity: 0.8, fontSize: "12px" }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            onClick={handlePhotoClick}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              backgroundImage: `url(${userPhoto})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "2px solid rgba(255,255,255,0.2)",
              marginBottom: "8px",
              cursor: "pointer",
            }}
          ></div>
          {storedUser && (
            <button
              onClick={handleLogout}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                background: "#e53935",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* אזור התוכן */}
      <div
        style={{
          background: THEME.cardWhite,
          flex: 1, // לוקח את כל המקום הפנוי בין ה-Header ל-BottomNav
          marginTop: "-30px", // שומר על העיצוב המעוגל שעולה על ה-Header
          borderTopLeftRadius: "30px",
          borderTopRightRadius: "30px",
          padding: "20px 20px 80px 20px", // הוספנו padding למטה (80px) כדי שהתוכן לא יוסתר ע"י התפריט
          display: "flex",
          flexDirection: "column",
          // overflowY: "auto", // מאפשר גלילה רק בתוך התוכן הלבן
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>

      <BottomNav />
    </div>
  );
};

export default MobileLayout;
