import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import ThemeContext from "../contexts/ThemeContext";
import { onAuthStateChanged } from "firebase/auth";
import { FaHome, FaComments, FaBars } from "react-icons/fa";
import logo from "../assets/skillswap-logo.png";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, () => {});
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          setProfile({ id: userDoc.id, ...userDoc.data() });

          const postsRef = collection(db, "posts");
          const postSnapshot = await getDocs(postsRef);
          const posts = postSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((post) => post.userId === userDoc.id);
          setUserPosts(posts);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [username]);

  if (!profile) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: isDark ? "#aaa" : "#555" }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: isDark ? "#0f172a" : "#f9fafb",
        color: isDark ? "#e2e8f0" : "#1e293b",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Sidebar */}
      {sidebarOpen && (
        <div
          style={{
            width: "240px",
            backgroundColor: "#4B5563",
            padding: "30px 20px",
            boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <img
              src={logo}
              alt="SkillSwap Logo"
              style={{ width: "140px", height: "auto", objectFit: "contain" }}
            />
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <SidebarItem icon={<FaHome />} text="Home" onClick={() => navigate("/home")} />
            <SidebarItem icon={<FaComments />} text="Chat" onClick={() => navigate("/chat")} />
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px" }}>
        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            backgroundColor: "#0EA5E9",
            color: "#fff",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaBars />
          {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        </button>

        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: isDark
              ? "0 4px 30px rgba(255, 255, 255, 0.05)"
              : "0 4px 30px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Profile Header */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <img
              src={profile.avatar || "https://via.placeholder.com/150"}
              alt="Avatar"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `4px solid #0EA5E9`,
                marginBottom: "16px",
              }}
            />
            <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#0EA5E9" }}>
              {profile.name}{" "}
              <span style={{ fontSize: "18px", color: "#64748B" }}>
                @{profile.username}
              </span>
            </h2>
            <p style={{ fontStyle: "italic", fontSize: "16px", color: "#64748B" }}>
              {profile.bio || "No bio provided."}
            </p>
          </div>

          {/* Skills Section */}
          <SkillSection title="Skills Known" skills={profile.skillsKnown} isDark={isDark} />
          <SkillSection title="Skills to Learn" skills={profile.skillsToLearn} isDark={isDark} />

          {/* Posts Section */}
          <hr style={{ margin: "40px 0", borderColor: isDark ? "#334155" : "#cbd5e1" }} />
          <h3 style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "700",
            color: "#0EA5E9",
            marginBottom: "25px"
          }}>
            Posts
          </h3>

          {userPosts.length === 0 ? (
            <p style={{ textAlign: "center", fontSize: "16px", color: "#64748B" }}>
              This user hasn’t posted anything yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    backgroundColor: isDark ? "#334155" : "#f8fafc",
                    padding: "20px",
                    borderRadius: "15px",
                    boxShadow: isDark
                      ? "0 2px 10px rgba(255,255,255,0.03)"
                      : "0 2px 10px rgba(0,0,0,0.06)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow = isDark
                      ? "0 6px 20px rgba(255,255,255,0.07)"
                      : "0 6px 20px rgba(0,0,0,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = isDark
                      ? "0 2px 10px rgba(255,255,255,0.03)"
                      : "0 2px 10px rgba(0,0,0,0.06)";
                  }}
                >
                  {post.mediaType === "image" && post.mediaData && (
                    <img
                      src={post.mediaData}
                      alt="Post"
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        marginBottom: "12px",
                      }}
                    />
                  )}
                  {post.mediaType === "video" && post.mediaData && (
                    <video
                      src={post.mediaData}
                      controls
                      style={{
                        width: "100%",
                        height: "160px",
                        borderRadius: "10px",
                        marginBottom: "12px",
                      }}
                    />
                  )}
                  <p><strong>Teaches:</strong> {post.teaches}</p>
                  <p><strong>Wants to Learn:</strong> {post.learns}</p>
                  <p><strong>Caption:</strong> {post.caption}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer",
      color: "#fff",
      padding: "10px 12px",
      borderRadius: "10px",
      transition: "background 0.3s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "#6b7280")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    {icon}
    {text}
  </div>
);

const SkillSection = ({ title, skills, isDark }) => (
  <div style={{ marginBottom: "30px" }}>
    <h4 style={{
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "12px",
      color: "#0EA5E9"
    }}>
      {title}
    </h4>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {skills?.length > 0 ? (
        skills.map((skill, idx) => (
          <span key={idx} style={badgeStyle(isDark)}>{skill}</span>
        ))
      ) : (
        <span style={{ color: "#94a3b8" }}>None</span>
      )}
    </div>
  </div>
);

const badgeStyle = (isDark) => ({
  backgroundColor: isDark ? "#475569" : "#dbeafe",
  color: isDark ? "#f8fafc" : "#0369a1",
  padding: "6px 14px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: "600",
  letterSpacing: "0.3px",
  transition: "transform 0.2s ease",
});

export default UserProfile;
