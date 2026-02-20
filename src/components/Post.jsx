import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import PostForm from "./PostForm";
import ThemeContext from "../contexts/ThemeContext";
import { FaHome, FaPlus } from "react-icons/fa";

function Post() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [allPosts, setAllPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === "dark";

  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const postList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const userSnapshot = await getDocs(collection(db, "users"));
    const users = userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const enrichedPosts = postList.map((post) => {
      const userProfile = users.find((u) => u.id === post.userId);
      return {
        ...post,
        username: userProfile?.username || post.username || "Anonymous",
      };
    });

    setAllPosts(enrichedPosts);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const styles = {
    page: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: darkMode ? "#121212" : "#f0f2f5",
      color: darkMode ? "#f5f5f5" : "#000000",
      fontFamily: "Arial, sans-serif",
    },
    sidebar: {
      width: "220px",
      backgroundColor: "#4B5563",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      color: "#ffffff",
    },
    navItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 15px",
      borderRadius: "10px",
      cursor: "pointer",
      color: "#ffffff",
      backgroundColor: "#4B5563",
      transition: "0.3s",
    },
    navItemHover: {
      backgroundColor: "#0EA5E9",
    },
    content: {
      marginLeft: "220px",
      padding: "40px",
      flex: 1,
      backgroundColor: darkMode ? "#121212" : "#f0f2f5",
    },
    postList: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "20px",
    },
    postCard: {
      backgroundColor: darkMode ? "#1f1f1f" : "#ffffff",
      padding: "15px",
      borderRadius: "10px",
      boxShadow: darkMode
        ? "0 0 10px rgba(255,255,255,0.05)"
        : "0 0 10px rgba(0,0,0,0.1)",
      transition: "0.3s",
      cursor: "pointer",
      border: "1px solid transparent",
    },
    postCardHover: {
      border: "1px solid #0EA5E9",
      transform: "scale(1.01)",
    },
    postMedia: {
      maxWidth: "100%",
      borderRadius: "10px",
      marginTop: "10px",
    },
    username: {
      fontWeight: "bold",
      color: "#0EA5E9",
      marginBottom: "10px",
      cursor: "pointer",
    },
    modalBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
      backdropFilter: "blur(3px)",
    },
    modalContent: {
      backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
      padding: "40px 30px 30px",
      borderRadius: "16px",
      maxWidth: "600px",
      width: "90%",
      position: "relative",
      boxShadow: darkMode
        ? "0 10px 30px rgba(255,255,255,0.1)"
        : "0 10px 30px rgba(0,0,0,0.2)",
      transition: "transform 0.3s ease, opacity 0.3s ease",
    },
    closeButton: {
      position: "absolute",
      top: "16px",
      right: "16px",
      backgroundColor: "#0EA5E9",
      border: "none",
      color: "white",
      padding: "6px 12px",
      fontSize: "16px",
      borderRadius: "50%",
      cursor: "pointer",
      transition: "0.3s ease",
      width: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: posting ? 0.5 : 1,
      pointerEvents: posting ? "none" : "auto",
    },
    closeButtonHover: {
      backgroundColor: "#0c8ccd",
    },
    modalTitle: {
      fontSize: "24px",
      marginBottom: "20px",
      textAlign: "center",
    },
    postingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#fff",
      fontSize: "20px",
      fontWeight: "bold",
      borderRadius: "16px",
      zIndex: 10,
    },
  };

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [closeHover, setCloseHover] = useState(false);

  const goToUserProfile = (username) => {
    if (username && username !== "Anonymous") {
      navigate(`/user/${username}`);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div
          style={{
            ...styles.navItem,
            ...(hoveredNav === "home" ? styles.navItemHover : {}),
          }}
          onMouseEnter={() => setHoveredNav("home")}
          onMouseLeave={() => setHoveredNav(null)}
          onClick={() => navigate("/home")}
        >
          <FaHome /> Home
        </div>
        <div
          style={{
            ...styles.navItem,
            ...(hoveredNav === "create" ? styles.navItemHover : {}),
          }}
          onMouseEnter={() => setHoveredNav("create")}
          onMouseLeave={() => setHoveredNav(null)}
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Create Post
        </div>
      </div>

      <div style={styles.content}>
        <h1>Recent Posts</h1>
        <div style={styles.postList}>
          {allPosts.length === 0 && <p>No posts found.</p>}
          {allPosts.map((post, index) => (
            <div
              key={post.id}
              style={{
                ...styles.postCard,
                ...(hoveredIndex === index ? styles.postCardHover : {}),
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => goToUserProfile(post.username)}
            >
              <div style={styles.username}>@{post.username}</div>
              {post.mediaType === "image" && post.mediaData && (
                <img src={post.mediaData} alt="post" style={styles.postMedia} />
              )}
              {post.mediaType === "video" && post.mediaData && (
                <video controls src={post.mediaData} style={styles.postMedia} />
              )}
              {post.caption && <p>{post.caption}</p>}
              {post.teaches && (
                <p>
                  <b>Teaches:</b> {post.teaches}
                </p>
              )}
              {post.learns && (
                <p>
                  <b>Wants to Learn:</b> {post.learns}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent}>
            {posting && <div style={styles.postingOverlay}>Posting...</div>}
            <h2 style={styles.modalTitle}>Create a New Post</h2>
            <PostForm
              user={user}
              posting={posting}
              setPosting={setPosting}
              onPostSubmit={() => {
                setShowModal(false);
                fetchPosts();
              }}
            />
            <button
              style={{
                ...styles.closeButton,
                ...(closeHover ? styles.closeButtonHover : {}),
              }}
              onMouseEnter={() => setCloseHover(true)}
              onMouseLeave={() => setCloseHover(false)}
              onClick={() => setShowModal(false)}
              disabled={posting}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;
