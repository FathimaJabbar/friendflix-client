import React, { useState, useEffect } from "react";
import { listenToAllUserChats } from "../firebase";
import "./Inbox.css";

export default function Inbox({ user, matches, onOpenPrivateChat, onOpenGroupChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!user) return;
    const unsub = listenToAllUserChats(user.uid, (all) => {
      const sorted = [...all].sort((a, b) => {
        const ta = a.lastMessageTime?.toMillis?.() || 0;
        const tb = b.lastMessageTime?.toMillis?.() || 0;
        return tb - ta;
      });
      setChats(sorted);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const resolvePrivate = (chat) => {
    const otherId = chat.participants?.find((id) => id !== user.uid);
    const match = matches.find((m) => m.userId === otherId);
    return {
      name: match?.displayName || (chat.isCustomGroup ? chat.name : "User " + (otherId?.substring(0, 4) || "Unknown")),
      photo: match?.photoURL || "",
      uid: otherId,
      matchRef: match,
    };
  };

  const isPrivate = (chat) => !chat.isCustomGroup && chat.participants?.length === 2;

  const filtered = chats.filter((chat) => {
    if (chat.isCustomGroup) return tab === "all" || tab === "groups";
    if (isPrivate(chat)) {
      const p = resolvePrivate(chat);
      if (!p.matchRef) return false; // Filter out proxy friends (non-matches)
      return tab === "all" || tab === "private";
    }
    return tab === "all";
  });

  const formatTime = (ts) => {
    if (!ts?.toDate) return "";
    const d = ts.toDate();
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleOpen = (chat) => {
    if (chat.isCustomGroup) {
      onOpenGroupChat({ id: chat.id, name: chat.name });
    } else {
      const p = resolvePrivate(chat);
      if (p.matchRef) {
        onOpenPrivateChat({
          uid: p.uid,
          displayName: p.name,
          photoURL: p.photo,
        });
      } else {
        alert("Could not find this friend in your matches.");
      }
    }
  };

  return (
    <div className="inbox-container page-wrapper">
      <h2 className="inbox-title">Messages</h2>

      <div className="inbox-tabs">
        {["all", "private", "groups"].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "all" ? "All" : t === "private" ? "💬 Direct" : "👥 Groups"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">
          <p style={{ animation: "pulse 1.5s infinite" }}>Loading conversations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No conversations yet</h3>
          <p>Start chatting with your matches or create a friend group!</p>
        </div>
      ) : (
        <div className="inbox-list">
          {filtered.map((chat) => {
            const priv = isPrivate(chat);
            const info = priv ? resolvePrivate(chat) : null;
            const displayName = priv ? info?.name : chat.name;
            const photo = priv ? info?.photo : null;
            const initial = (displayName || "?").charAt(0).toUpperCase();

            return (
              <div key={chat.id} className="inbox-item glass-card" onClick={() => handleOpen(chat)}>
                <div className="inbox-avatar">
                  {photo ? (
                    <img src={photo} alt={displayName} />
                  ) : (
                    <span>{initial}</span>
                  )}
                  {!priv && <div className="group-badge">👥</div>}
                </div>
                <div className="inbox-details">
                  <div className="inbox-row">
                    <span className="inbox-name">{displayName}</span>
                    <span className="inbox-time">{formatTime(chat.lastMessageTime)}</span>
                  </div>
                  <p className="inbox-preview">
                    {chat.lastMessage || "No messages yet — say hi!"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
