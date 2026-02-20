import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../contexts/ThemeContext";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaHome } from "react-icons/fa";

const MyProfile = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [usernameError, setUsernameError] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    bio: "",
    avatar: "https://via.placeholder.com/110",
    skillsKnown: [],
    skillsToLearn: [],
  });
  const [myPosts, setMyPosts] = useState([]);
  const [skillInput, setSkillInput] = useState({ known: "", learn: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) setProfile(docSnap.data());

        const postsRef = collection(db, "posts");
        const q = query(postsRef, where("userId", "==", currentUser.uid));
        const snapshot = await getDocs(q);
        setMyPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } else navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  const saveProfileToFirestore = async () => {
    if (!user) return;
    setUsernameError("");
    const usernameTrimmed = profile.username.trim().toLowerCase();
    if (!usernameTrimmed) {
      setUsernameError("Username is required.");
      return;
    }
    const q = query(collection(db, "users"), where("username", "==", usernameTrimmed));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.some((doc) => doc.id !== user.uid)) {
      setUsernameError("Username is already taken.");
      return;
    }
    await setDoc(doc(db, "users", user.uid), { ...profile, username: usernameTrimmed });
    setIsEditing(false);
  };

  const handleChange = (e) => setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfile((p) => ({ ...p, avatar: URL.createObjectURL(file) }));
  };

  const handleSkillAdd = (type) => {
    if (!skillInput[type]) return;
    const key = type === "known" ? "skillsKnown" : "skillsToLearn";
    setProfile((p) => ({
      ...p,
      [key]: [...p[key], skillInput[type].trim()],
    }));
    setSkillInput((s) => ({ ...s, [type]: "" }));
  };

  const handleSkillDelete = (type, index) => {
    const key = type === "known" ? "skillsKnown" : "skillsToLearn";
    setProfile((p) => ({
      ...p,
      [key]: p[key].filter((_, i) => i !== index),
    }));
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
      <div style={{ width: "70px", backgroundColor: "#4B5563", padding: "20px 10px" }}>
        <div onClick={() => navigate("/home")} style={{ cursor: "pointer", color: "#ffffff" }}>
          <FaHome size={24} />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
            height: "200px",
            borderBottomLeftRadius: "40px",
            borderBottomRightRadius: "40px",
          }}
        ></div>

        <div
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            margin: "-100px auto 40px",
            borderRadius: "20px",
            padding: "40px",
            maxWidth: "900px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
            <img
              src={profile.avatar}
              alt="avatar"
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "20px",
                objectFit: "cover",
                border: `4px solid ${isDark ? "#3a7bd5" : "#0EA5E9"}`,
              }}
            />
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <>
                  <input name="name" value={profile.name} onChange={handleChange} placeholder="Your Name" style={{ width: "100%", padding: "10px", marginBottom: "8px" }} />
                  <input name="username" value={profile.username} onChange={handleChange} placeholder="Unique Username" style={{ width: "100%", padding: "10px", marginBottom: "8px" }} />
                  {usernameError && <div style={{ color: "red", marginBottom: "10px" }}>{usernameError}</div>}
                  <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Your Bio" style={{ width: "100%", padding: "10px", height: "80px", marginBottom: "8px" }} />

                  {/* Skills Known */}
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Skills Known:</strong>
                    <div style={{ display: "flex", marginTop: "5px" }}>
                      <input
                        value={skillInput.known}
                        onChange={(e) => setSkillInput({ ...skillInput, known: e.target.value })}
                        placeholder="Add skill"
                        style={{ flex: 1, padding: "8px" }}
                      />
                      <button onClick={() => handleSkillAdd("known")} style={{ marginLeft: "8px", padding: "8px 12px", background: "#0EA5E9", color: "#fff", border: "none", borderRadius: "6px" }}>Add</button>
                    </div>
                    <ul style={{ paddingLeft: "20px", marginTop: "6px" }}>
                      {profile.skillsKnown.map((skill, i) => (
                        <li key={i}>
                          {skill}
                          <button onClick={() => handleSkillDelete("known", i)} style={{ marginLeft: "10px", background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}>✕</button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills to Learn */}
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Skills to Learn:</strong>
                    <div style={{ display: "flex", marginTop: "5px" }}>
                      <input
                        value={skillInput.learn}
                        onChange={(e) => setSkillInput({ ...skillInput, learn: e.target.value })}
                        placeholder="Add skill"
                        style={{ flex: 1, padding: "8px" }}
                      />
                      <button onClick={() => handleSkillAdd("learn")} style={{ marginLeft: "8px", padding: "8px 12px", background: "#0EA5E9", color: "#fff", border: "none", borderRadius: "6px" }}>Add</button>
                    </div>
                    <ul style={{ paddingLeft: "20px", marginTop: "6px" }}>
                      {profile.skillsToLearn.map((skill, i) => (
                        <li key={i}>
                          {skill}
                          <button onClick={() => handleSkillDelete("learn", i)} style={{ marginLeft: "10px", background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}>✕</button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ marginTop: "8px" }} />
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "4px" }}>{profile.name}</h2>
                  <p style={{ fontSize: "16px", color: "#647488", marginBottom: "4px" }}>@{profile.username}</p>
                  <p style={{ fontSize: "15px", color: "#4B5563", marginBottom: "8px" }}>{profile.bio}</p>
                  <p><strong>Skills Known:</strong> {profile.skillsKnown.join(", ") || "None"}</p>
                  <p><strong>Skills to Learn:</strong> {profile.skillsToLearn.join(", ") || "None"}</p>
                </>
              )}
            </div>
            <div>
              {isEditing ? (
                <>
                  <button onClick={saveProfileToFirestore} style={{ padding: "10px 20px", background: "#0EA5E9", color: "#fff", borderRadius: "8px", border: "none", marginRight: "8px" }}>Save</button>
                  <button onClick={() => setIsEditing(false)} style={{ padding: "10px 20px", background: "#647488", color: "#fff", borderRadius: "8px", border: "none" }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} style={{ padding: "10px 20px", background: "#0EA5E9", color: "#fff", borderRadius: "8px", border: "none" }}>Edit Profile</button>
              )}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "40px" }}>
          <h3 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "20px" }}>Your Posts</h3>
          {myPosts.length === 0 && <p>No posts yet.</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
            {myPosts.map((post) => (
              <div key={post.id} style={{ backgroundColor: isDark ? "#334155" : "#f1f5f9", padding: "14px", borderRadius: "12px" }}>
                {post.mediaType === "image" && post.mediaData && (
                  <img src={post.mediaData} alt="post" style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" }} />
                )}
                {post.caption && <p style={{ fontSize: "14px", marginBottom: "6px" }}>{post.caption}</p>}
                <p style={{ fontSize: "13px" }}><strong>Teaches:</strong> {post.teaches}</p>
                <p style={{ fontSize: "13px" }}><strong>Wants to Learn:</strong> {post.learns}</p>
                <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                  <button style={{ padding: "5px 10px", fontSize: "12px", background: "#0EA5E9", color: "#fff", border: "none", borderRadius: "6px" }}>Edit</button>
                  <button onClick={() => deletePost(post.id)} style={{ padding: "5px 10px", fontSize: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
