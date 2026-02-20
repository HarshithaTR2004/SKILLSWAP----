import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Signup from "./components/Login";
import Login from "./components/SkillSwapLogin";
import Home from "./components/Home";
import MyProfile from "./components/MyProfile";
import Chat from "./components/Chat";
import Post from "./components/Post";
import MyLearning from "./components/MyLearning";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/post" element={<Post />} />
        <Route path="/learning" element={<MyLearning />} />
        <Route path="/mylearning" element={<MyLearning />} /> {/* optional support */}
        <Route path="/user/:username" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
