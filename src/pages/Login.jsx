import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { THEME } from "../theme.js";

// הכתובת של השרת שלך
const SERVER_URL = "https://fitness-app-backend-52qn.onrender.com";

const LoginRegisterServer = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [team, setTeam] = useState("1");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛑 השינוי הגדול כאן: הוספנו את הקידומת /auth
    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    const payload = isLogin
      ? { name: username, password }
      : { name: username, password, team: parseInt(team), role: "user" };

    try {
      const res = await fetch(`${SERVER_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(isLogin ? "Login successful!" : "Registration successful!");
        console.log("Server response:", data);

        // שמירת המשתמש ב-localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        // שמירת הטוקן (אם השרת מחזיר אותו) לשימוש עתידי
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // מעבר לעמוד הבית
        navigate("/home");
      } else {
        setMessage(data.message || "Error occurred");
      }
    } catch (err) {
      console.error(err);
      setMessage("Cannot connect to server");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#e0e0e0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: THEME.cardWhite,
          borderRadius: "30px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: THEME.blueDark, marginBottom: "10px" }}>
          {isLogin ? "Login" : "Register"}
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: `1px solid ${THEME.circleBg}`,
              fontSize: "14px",
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: `1px solid ${THEME.circleBg}`,
              fontSize: "14px",
            }}
            required
          />

          {!isLogin && (
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "12px",
                border: `1px solid ${THEME.circleBg}`,
                fontSize: "14px",
                backgroundColor: THEME.cardWhite,
                color: THEME.textDark,
              }}
            >
              <option value="1">Team 1</option>
              <option value="2">Team 2</option>
              <option value="3">Team 3</option>
              <option value="4">Team 4</option>
            </select>
          )}

          <button
            type="submit"
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: THEME.blueDark,
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: "15px",
              color: THEME.blueDark,
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            marginTop: "20px",
            fontSize: "12px",
            color: THEME.textGrey,
            cursor: "pointer",
          }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterServer;
