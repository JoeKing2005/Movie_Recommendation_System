import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import SignUp from "./Components/SignUp/SignUp";
import LogIn from "./Components/LogIn/Login";

function Home() {
  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ color: "white", marginBottom: 16 }}>Movie Recommendation System</h1>
      <p style={{ color: "#9aa4b2", marginBottom: 24 }}>
        Welcome! Choose an option below to continue.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Link to="/login" style={{ padding: "10px 14px", border: "1px solid #1f232b", borderRadius: 10, color: "white", background: "#161922", fontWeight: 600 }}>Log in</Link>
        <Link to="/signup" style={{ padding: "10px 14px", border: "1px solid #5e3dff", borderRadius: 10, color: "white", background: "linear-gradient(135deg, #7c5cff, #5e3dff)", fontWeight: 600 }}>Sign up</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<LogIn />} />
    </Routes>
  );
}

export default App;
