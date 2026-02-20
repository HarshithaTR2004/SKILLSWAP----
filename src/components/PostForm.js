import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const PostForm = ({ user, onPostSubmit, setPosting, posting }) => {
  const [caption, setCaption] = useState("");
  const [teaches, setTeaches] = useState("");
  const [learns, setLearns] = useState("");
  const [mediaData, setMediaData] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUsername(data.username || "Anonymous");
        } else {
          console.warn("User document not found");
          setUsername("Anonymous");
        }
      } catch (error) {
        console.error("Failed to fetch username:", error);
        setUsername("Anonymous");
      }
    };
    fetchUsername();
  }, [user]);

  const resizeImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 800;
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
      ? "video"
      : null;

    if (!type) {
      alert("Only image or video files are allowed.");
      return;
    }

    if (type === "image") {
      const compressedBase64 = await resizeImage(file);
      const base64Length = compressedBase64.length * (3 / 4);
      if (base64Length > 900000) {
        alert("Image too large even after compression.");
        return;
      }
      setMediaType("image");
      setMediaData(compressedBase64);
      setPreviewUrl(compressedBase64);
    }

    if (type === "video") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaType("video");
        setMediaData(reader.result);
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !username) {
      alert("Please wait for username to load.");
      return;
    }

    if (setPosting) setPosting(true);

    const postData = {
      userId: user.uid,
      username,
      mediaType,
      mediaData: mediaData || "",
      caption,
      teaches,
      learns,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "posts"), postData);
      setCaption("");
      setTeaches("");
      setLearns("");
      setMediaData(null);
      setPreviewUrl(null);
      setMediaType(null);
      if (onPostSubmit) onPostSubmit();
    } catch (error) {
      console.error("Error posting:", error);
      alert("Something went wrong while posting.");
    } finally {
      if (setPosting) setPosting(false);
    }
  };

  const styles = {
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      marginBottom: "40px",
      backgroundColor: "#f1f1f1",
      padding: "16px",
      borderRadius: "10px",
    },
    input: {
      padding: "10px",
      fontSize: "14px",
      borderRadius: "6px",
      border: "1px solid #ccc",
    },
    button: {
      backgroundColor: posting ? "#aaa" : "#28a745",
      color: "#fff",
      border: "none",
      padding: "10px",
      borderRadius: "6px",
      cursor: posting ? "not-allowed" : "pointer",
      fontWeight: "bold",
    },
    preview: {
      maxWidth: "100%",
      maxHeight: "300px",
      borderRadius: "10px",
      marginTop: "10px",
    },
    spinner: {
      marginLeft: "10px",
      width: "16px",
      height: "16px",
      border: "2px solid #fff",
      borderTop: "2px solid transparent",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
    "@keyframes spin": {
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" },
    },
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        placeholder="What skill are you teaching?"
        value={teaches}
        onChange={(e) => setTeaches(e.target.value)}
        style={styles.input}
        required
      />
      <input
        type="text"
        placeholder="What skill do you want to learn?"
        value={learns}
        onChange={(e) => setLearns(e.target.value)}
        style={styles.input}
        required
      />
      <textarea
        placeholder="Write a caption or description..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        style={styles.input}
        rows="3"
      />
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleMediaChange}
        style={styles.input}
      />

      {/* Media Preview */}
      {previewUrl &&
        (mediaType === "image" ? (
          <img src={previewUrl} alt="preview" style={styles.preview} />
        ) : (
          <video src={previewUrl} controls style={styles.preview} />
        ))}

      <button type="submit" style={styles.button} disabled={posting || !username}>
        {posting ? (
          <>
            Posting...
            <span style={styles.spinner}></span>
          </>
        ) : (
          "Post"
        )}
      </button>
    </form>
  );
};

export default PostForm;
