import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../contexts/ThemeContext";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import logo from "../assets/skillswap-logo.png";
import {
  FaHome,
  FaUser,
  FaComments,
  FaPlusSquare,
  FaBookOpen,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [dropdowns, setDropdowns] = useState({
    programming: false,
    arts: false,
    languages: false,
    music: false,
  });

  const categoryMap = {
    Programming: "programming",
    "Creative Arts": "arts",
    Languages: "languages",
    Music: "music",
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCol = collection(db, "users");
        const usersSnapshot = await getDocs(usersCol);
        const allUsers = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfiles(allUsers);

        const postsCol = collection(db, "posts");
        const postsSnapshot = await getDocs(postsCol);
        let allPosts = postsSnapshot.docs.map((doc) => {
          const postData = doc.data();
          const userProfile = allUsers.find((u) => u.id === postData.userId);
          return {
            id: doc.id,
            ...postData,
            username: userProfile?.username || "Anonymous",
          };
        });

        // Shuffle posts
        for (let i = allPosts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allPosts[i], allPosts[j]] = [allPosts[j], allPosts[i]];
        }

        setPosts(allPosts);
      } catch (error) {
        console.error("Failed to fetch posts or profiles:", error);
      }
    };
    fetchData();
  }, []);

  const handleDropdownToggle = (key) => {
    setDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill.toLowerCase());
    setSearchInput("");
  };

  const handleProfileClick = (profile) => {
    navigate(`/profile/${profile.username}`);
  };

  const handlePostClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const filteredProfiles = profiles.filter((profile) => {
    const search = selectedSkill || searchInput.toLowerCase();
    return (
      profile.name?.toLowerCase().includes(search) ||
      profile.username?.toLowerCase().includes(search) ||
      profile.skillsKnown?.some((skill) => skill.toLowerCase().includes(search)) ||
      profile.skillsToLearn?.some((skill) => skill.toLowerCase().includes(search))
    );
  });

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      body {
        transition: background-color 0.3s, color 0.3s;
      }
      .nav-item:hover {
        background-color: ${isDark ? "#2d3748" : "#3e5c76"};
      }
      .dropdown-item:hover {
        background-color: ${isDark ? "#444" : "#e2e8f0"};
      }
      .category-button:hover {
        background-color: ${isDark ? "#555" : "#cbe9ff"} !important;
      }
    `;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, [isDark]);

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: isDark ? "#121212" : "#f5f5f5", color: isDark ? "#e0e0e0" : "#222" }}>
      {/* Sidebar */}
      <aside style={{
        width: "250px",
        backgroundColor: isDark ? "#1f2937" : "#2d3e50",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "20px 10px",
        borderTopRightRadius: "80px",
        boxShadow: isDark ? "2px 0 10px rgba(0,0,0,0.7)" : "2px 0 10px rgba(0,0,0,0.2)"
      }}>
        <img src={logo} alt="SkillSwap Logo" style={{ width: "180px", margin: "0 auto 10px", cursor: "pointer" }} onClick={() => navigate("/home")} />
        <div style={{ marginBottom: "20px", marginTop: "10px" }}>
          <button onClick={toggleTheme} style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 12px",
            borderRadius: "8px",
            backgroundColor: "#374151",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            width: "100%",
            marginBottom: "10px"
          }}>
            {isDark ? <FaSun /> : <FaMoon />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
            borderTop: "1px solid #44566c"
          }}>
            <span style={{ fontWeight: "bold" }}>{user?.displayName || "User"}</span>
            <FaSignOutAlt onClick={() => auth.signOut()} style={{ cursor: "pointer" }} />
          </div>
        </div>

        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "15px", flexGrow: 1 }}>
          {[{ label: "Home", icon: <FaHome />, path: "/home" }, { label: "My Profile", icon: <FaUser />, path: "/profile" }, { label: "Post", icon: <FaPlusSquare />, path: "/post" }, { label: "Chat", icon: <FaComments />, path: "/chat" }, { label: "My Learning", icon: <FaBookOpen />, path: "/mylearning" }]
            .map(({ label, icon, path }) => (
              <li key={label} className="nav-item" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", borderRadius: "8px", cursor: "pointer" }} onClick={() => navigate(path)}>
                {icon} {label}
              </li>
            ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <input
          style={{ width: "100%", padding: "10px 15px", fontSize: "16px", borderRadius: "8px", marginBottom: "30px", backgroundColor: isDark ? "#303030" : "#fff", color: isDark ? "#eee" : "#222", border: `1px solid ${isDark ? "#555" : "#ccc"}` }}
          type="text"
          placeholder="Find experts in hundreds of skills ready to share their knowledge with you"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setSelectedSkill("");
          }}
        />

        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Popular Skill Categories</h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px" }}>
          {Object.keys(categoryMap).map((cat) => (
            <button
              key={cat}
              className="category-button"
              style={{ padding: "8px 16px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: "bold", backgroundColor: isDark ? "#333" : "#e0f2ff", color: isDark ? "#fff" : "#007acc" }}
              onClick={() => handleDropdownToggle(categoryMap[cat])}
            >
              {cat} <FaChevronDown />
            </button>
          ))}
        </div>

        {dropdowns.programming && (
          <SkillList items={["C", "C++", "Python", "Java", "Dsa"]} onClick={handleSkillClick} isDark={isDark} />
        )}
        {dropdowns.arts && (
          <SkillList items={["Painting", "Sketching", "Sculpture", "Fine art", "Pottery", "Textile arts", "Drawing", "Decorative arts", "Photography"]} onClick={handleSkillClick} isDark={isDark} />
        )}
        {dropdowns.languages && (
          <SkillList items={["English", "Tamil", "Telugu", "Malayalam", "Hindi", "Chinese", "Spanish", "Arabic", "French", "Persian", "German", "Russian", "Malay", "Portuguese", "Italian", "Turkish", "Lahnda", "Urdu", "Korean", "Bengali", "Japanese", "Vietnamese", "Marathi", "Kanada"]} onClick={handleSkillClick} isDark={isDark} />
        )}
        {dropdowns.music && (
          <SkillList items={["Pop music", "Art music", "Folk music", "Popular music", "Hip-hop"]} onClick={handleSkillClick} isDark={isDark} />
        )}

        <div style={{ textAlign: "center", marginTop: "30px", marginBottom: "10px" }}>
          Trade your skills with our peer-to-peer Skill Exchange platform, where learning is a shared adventure.
        </div>

        {searchInput.trim() || selectedSkill ? (
          <ProfileResults profiles={filteredProfiles} onClick={handleProfileClick} isDark={isDark} />
        ) : (
          <PostResults posts={posts} onClick={handlePostClick} isDark={isDark} />
        )}
      </main>
    </div>
  );
};

// Reusable Dropdown Skill Items
const SkillList = ({ items, onClick, isDark }) => (
  <div style={{ marginTop: "10px", paddingLeft: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
    {items.map((skill) => (
      <span key={skill} className="dropdown-item" style={{ padding: "5px 10px", borderRadius: "5px", cursor: "pointer", backgroundColor: isDark ? "#333" : "#f1f1f1" }} onClick={() => onClick(skill)}>{skill}</span>
    ))}
  </div>
);

// Profile Results
const ProfileResults = ({ profiles, onClick, isDark }) => (
  <div>
    <h3>Matching Profiles</h3>
    {profiles.length === 0 ? (
      <div style={{ textAlign: "center", fontSize: "18px", color: isDark ? "#666" : "#888", marginTop: "10px" }}>No matching profiles found.</div>
    ) : (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {profiles.map((profile) => (
          <div key={profile.id} style={{ minWidth: "300px", background: isDark ? "#282828" : "#fff", borderRadius: "15px", boxShadow: isDark ? "0 2px 6px rgba(255,255,255,0.1)" : "0 2px 6px rgba(0,0,0,0.1)", padding: "10px", cursor: "pointer" }} onClick={() => onClick(profile)}>
            <p><b>Name:</b> {profile.name || "N/A"}<br /><b>Username:</b> {profile.username || "N/A"}<br /><b>Knows:</b> {profile.skillsKnown?.join(", ") || "None"}<br /><b>Wants to Learn:</b> {profile.skillsToLearn?.join(", ") || "None"}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Post Results
const PostResults = ({ posts, onClick, isDark }) => (
  <div style={{ marginTop: "20px" }}>
    <h3>Recent Posts</h3>
    {posts.length === 0 ? (
      <div style={{ textAlign: "center", fontSize: "18px", color: isDark ? "#666" : "#888", marginTop: "10px" }}>No posts available yet.</div>
    ) : (
      <div style={{ display: "flex", overflowX: "auto", gap: "20px", paddingBottom: "20px" }}>
        {posts.map((post) => (
          <div key={post.id} style={{ minWidth: "300px", background: isDark ? "#282828" : "#fff", borderRadius: "15px", padding: "10px", boxShadow: isDark ? "0 2px 6px rgba(255,255,255,0.1)" : "0 2px 6px rgba(0,0,0,0.1)", cursor: "pointer" }} onClick={() => onClick(post.username)}>
            <p><b>{post.username || "Anonymous"}</b></p>
            {post.mediaType === "image" && post.mediaData && <img src={post.mediaData} alt="Post" style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px", backgroundColor: "#000" }} />}
            {post.mediaType === "video" && post.mediaData && <video src={post.mediaData} controls muted style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px" }} />}
            <p><b>Teaches:</b> {post.teaches}<br /><b>Wants to Learn:</b> {post.learns}<br /><b>Caption:</b> {post.caption}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Home;
