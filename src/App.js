import React, { useState, useEffect } from "react";
import UserProfile from "./components/UserProfile";
import Chat from "./components/Chat";
import { auth, onAuthStateChanged, logout } from "./firebase";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("welcome"); // "welcome" | "profile" | "chat"

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setPage("profile");
      else setPage("welcome");
    });
    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Welcome to FriendFlix</h1>
        <p>Please sign in to continue.</p>
        {/* Add your sign in button here */}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <nav
        style={{
          width: 200,
          backgroundColor: "#222",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: 20,
          gap: 10,
        }}
      >
        <button onClick={() => setPage("profile")} style={navButtonStyle}>
          Profile
        </button>
        <button onClick={() => setPage("chat")} style={navButtonStyle}>
          Chat with Me
        </button>
        <button
          onClick={() => logout()}
          style={{ ...navButtonStyle, marginTop: "auto", backgroundColor: "red" }}
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        {page === "profile" && <UserProfile user={user} />}
        {page === "chat" && <Chat user={user} friend={{ uid: "jPvC75Bb8tZ4OJHPPXiu2tYJaVJ2", displayName: "Fathima Jabbar" }} />}
      </main>
    </div>
  );
}

const navButtonStyle = {
  padding: "10px 15px",
  backgroundColor: "#444",
  color: "white",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
  fontSize: 16,
};
