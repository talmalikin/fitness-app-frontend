import Home from "./pages/Home.jsx";
import LeadBoard from "./pages/LeadBoard.jsx";
import ALL from "./pages/All.jsx"; // צריך ליצור את העמוד ALL
import Login from "./pages/Login.jsx";
import Admin from "./pages/admin.jsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/all" element={<ALL />} />
        <Route path="/leaderboard" element={<LeadBoard />} />
        <Route path="/onlyadmincanview" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
