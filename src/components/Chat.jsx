import React, { useState, useEffect, useContext } from "react";
import { db, auth } from "../firebase";
import {
  collection, query, where, orderBy, addDoc, onSnapshot,
  getDocs, setDoc, doc, serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ThemeContext from "../contexts/ThemeContext";

const Chat = () => {
  const { theme } = useContext(ThemeContext);
  const darkMode = theme === "dark";

  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [status, setStatus] = useState("none");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastMessages, setLastMessages] = useState({});

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.id !== user.uid);
      setAllUsers(users);
    };

    const fetchIncomingRequests = () => {
      const q = query(
        collection(db, "chatRequests"),
        where("toId", "==", user.uid),
        where("status", "==", "pending")
      );
      return onSnapshot(q, async (snap) => {
        const reqs = await Promise.all(
          snap.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", data.fromId)));
            const username = userDoc.docs[0]?.data()?.username || data.fromId.slice(0, 6);
            return { id: docSnap.id, ...data, fromUsername: username };
          })
        );
        setIncoming(reqs);
      });
    };

    const fetchLastMessages = async () => {
      let lastMsgs = {};
      for (const u of allUsers) {
        const chatId = getChatId(user.uid, u.id);
        const msgSnap = await getDocs(query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "desc")));
        if (!msgSnap.empty) lastMsgs[u.id] = msgSnap.docs[0].data().text;
      }
      setLastMessages(lastMsgs);
    };

    fetchUsers().then(fetchLastMessages);
    const unsub = fetchIncomingRequests();
    return unsub;
  }, [user]);

  const getChatId = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`);

  const selectUser = async (u) => {
    setSelected(u);
    setMessages([]);
    const chatId = getChatId(user.uid, u.id);

    const q = query(
      collection(db, "chatRequests"),
      where("fromId", "in", [user.uid, u.id]),
      where("toId", "in", [user.uid, u.id])
    );
    const snap = await getDocs(q);
    const req = snap.docs[0]?.data();

    if (req?.status === "accepted") {
      setStatus("accepted");
      onSnapshot(query(collection(db, "chats", chatId, "messages"), orderBy("timestamp")),
        (snap) => setMessages(snap.docs.map((d) => d.data()))
      );
    } else {
      setStatus(req?.status || "none");
    }
  };

  const sendRequest = async () => {
    await addDoc(collection(db, "chatRequests"), {
      fromId: user.uid,
      toId: selected.id,
      status: "pending",
      timestamp: serverTimestamp(),
    });
    setStatus("pending");
  };

  const acceptRequest = async (req) => {
    await setDoc(doc(db, "chatRequests", req.id), { ...req, status: "accepted" });
    if (selected?.id === req.fromId) setStatus("accepted");
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    const chatId = getChatId(user.uid, selected.id);
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: newMsg.trim(),
      senderId: user.uid,
      timestamp: serverTimestamp(),
    });
    setNewMsg("");
  };

  const filteredUsers = allUsers.filter((u) =>
    (u.username || u.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      display: "flex", height: "100vh",
      fontFamily: "'Segoe UI', sans-serif",
      backgroundColor: darkMode ? "#1e1e2f" : "#e9eff6",
      color: darkMode ? "#fff" : "#000"
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 320,
        background: "#4B5563",
        padding: 20,
        borderRight: "1px solid #2F3B46",
        overflowY: "auto"
      }}>
        <h2 style={{ fontSize: 18, color: "#fff" }}>Users</h2>
        <input
          type="text"
          placeholder=" Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%", padding: 10, margin: "12px 0", borderRadius: 10,
            border: "1px solid #ccc", backgroundColor: "#f9f9f9",
            color: "#000"
          }}
        />
        {filteredUsers.map((u) => (
          <div key={u.id} onClick={() => selectUser(u)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: 10, marginBottom: 8,
            backgroundColor: selected?.id === u.id ? "#0EA5E9" : "#6B7280",
            borderRadius: 10, cursor: "pointer",
            border: selected?.id === u.id ? "2px solid #0EA5E9" : "1px solid #ccc"
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#bbb", overflow: "hidden" }}>
              <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username || "User"}`} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <strong style={{ color: "#fff" }}>@{u.username || u.id.slice(0, 6)}</strong>
              <p style={{ fontSize: 13, color: "#ddd" }}>
                {lastMessages[u.id] ? `Last: ${lastMessages[u.id]}` : "No messages yet"}
              </p>
            </div>
          </div>
        ))}
        <h3 style={{ marginTop: 30, fontSize: 16, color: "#FBBF24" }}>Chat Requests</h3>
        {incoming.length === 0 ? (
          <p style={{ fontSize: 14, color: "#ccc" }}>No requests</p>
        ) : (
          incoming.map((req) => (
            <div key={req.id} style={{
              padding: 12, backgroundColor: "#fff3cd",
              margin: "10px 0", borderRadius: 8, border: "1px solid #f0c36d", color: "#000"
            }}>
              From: <strong>@{req.fromUsername}</strong>
              <button onClick={() => acceptRequest(req)} style={{
                marginTop: 8, padding: "6px 14px", backgroundColor: "#0EA5E9",
                color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600
              }}>
                Accept
              </button>
            </div>
          ))
        )}
      </aside>

      {/* Chat Window */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24 }}>
        {selected ? (
          <>
            <h2 style={{
              fontSize: 22, borderBottom: "2px solid",
              borderColor: darkMode ? "#444" : "#ddd", paddingBottom: 10, marginBottom: 10,
              color: "#0EA5E9"
            }}>
              Chat with @{selected.username || selected.id.slice(0, 6)}
            </h2>

            <div style={{
              flex: 1, overflowY: "auto", marginBottom: 20, padding: 16,
              display: "flex", flexDirection: "column",
              backgroundColor: darkMode ? "#2e2e3e" : "#ffffff",
              borderRadius: 10, border: "1px solid", borderColor: darkMode ? "#444" : "#ccc"
            }}>
              {status === "accepted" ? (
                messages.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.senderId === user.uid ? "flex-end" : "flex-start",
                    backgroundColor: msg.senderId === user.uid ? "#0EA5E9" : (darkMode ? "#616161" : "#eeeeee"),
                    color: msg.senderId === user.uid ? "#fff" : "#000",
                    padding: "10px 14px", borderRadius: "20px", margin: "6px 0",
                    maxWidth: "65%", wordBreak: "break-word", fontSize: 15
                  }}>
                    {msg.text}
                  </div>
                ))
              ) : status === "pending" ? (
                <p style={{ color: "#aaa" }}>Waiting for chat acceptance...</p>
              ) : (
                <button onClick={sendRequest} style={{
                  padding: "10px 20px", backgroundColor: "#0EA5E9", color: "#fff",
                  border: "none", borderRadius: 20, marginTop: 16, cursor: "pointer", fontWeight: 600
                }}>
                  Send Chat Request
                </button>
              )}
            </div>

            {status === "accepted" && (
              <form onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }} style={{ display: "flex", gap: 10 }}>
                <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..." style={{
                  flex: 1, padding: 12, borderRadius: 20, border: "1px solid #ccc",
                  outline: "none", fontSize: 14
                }} />
                <button type="submit" style={{
                  padding: "12px 20px", backgroundColor: "#0EA5E9",
                  color: "white", border: "none", borderRadius: 20, fontWeight: 600, cursor: "pointer"
                }}>
                  Send
                </button>
              </form>
            )}
          </>
        ) : (
          <p style={{ color: darkMode ? "#ccc" : "#666", fontSize: 16, marginTop: 20 }}>
            Select a user to start chatting.
          </p>
        )}
      </main>
    </div>
  );
};

export default Chat;
