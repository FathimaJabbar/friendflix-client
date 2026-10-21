import React, { useState, useEffect, useRef } from "react";
import {
  createOrGetChat,
  listenToChatMessages,
  sendMessage,
  blockUser,
  reportUser,
  db
} from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./GroupChat.css";
import "./Chat.css";

export default function Chat({ user, friend, onBack, onBlockSuccess }) {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [friendDetails, setFriendDetails] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const friendUid = friend?.uid || friend?.userId;
    if (!user?.uid || !friendUid) return;

    let unsubscribe = null;

    async function setupChat() {
      try {
        const id = await createOrGetChat(user.uid, friendUid);
        setChatId(id);

        unsubscribe = listenToChatMessages(id, (msgs) => {
          setMessages(msgs);
        });
      } catch (err) {
        console.error("Error setting up chat:", err);
      }
    }

    setupChat();

    const fetchFriendDetails = async () => {
      try {
        const docSnap = await getDoc(doc(db, "users", friendUid));
        if (docSnap.exists()) {
          setFriendDetails(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching friend profile:", err);
      }
    };
    fetchFriendDetails();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, friend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (input.trim() === "" || !chatId) return;

    try {
      await sendMessage(chatId, user.uid, input.trim(), "text", null, user.photoURL);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Message failed to send. Check your connection or Firestore permissions.");
    }
  }

  const handleBlock = async () => {
    const friendUid = friend?.uid || friend?.userId;
    if (window.confirm(`Are you sure you want to block ${friend.displayName}? They will be removed from your matches.`)) {
      try {
        await blockUser(user.uid, friendUid);
        alert("User blocked successfully.");
        if (onBlockSuccess) onBlockSuccess();
      } catch (err) {
        console.error(err);
        alert("Failed to block user. Check Firestore permissions.");
      }
    }
  };

  const handleReport = async () => {
    const friendUid = friend?.uid || friend?.userId;
    const reason = window.prompt(`Why are you reporting ${friend.displayName}?`);
    if (reason && reason.trim() !== "") {
      try {
        await reportUser(user.uid, friendUid, reason);
        alert("Report submitted successfully. We will review it shortly.");
        setShowMenu(false);
      } catch (err) {
        console.error(err);
        alert("Failed to submit report.");
      }
    }
  };

  const handleLeave = () => {
    if (window.confirm("Are you sure you want to leave this chat?")) {
      onBack();
    }
  };

  const handleScheduleEvent = async () => {
    if (!eventDate) return;
    try {
      await sendMessage(chatId, user.uid, "", "event", {
        title: "Movie Night Screening",
        dateTime: eventDate
      }, user.photoURL);
      setShowPlanner(false);
      setEventDate("");
    } catch (err) {
      console.error(err);
    }
  };

  const friendDisplayName = friend?.displayName || friendDetails?.displayName || "Friend";
  const friendPhoto = friend?.photoURL || friendDetails?.photoURL;

  return (
    <div className="chat-container">
      <div className="chat-header glass-panel">
        <button className="nav-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </button>

        <div 
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", cursor: "pointer" }}
          onClick={() => setIsViewingProfile(true)}
          title="View Profile"
        >
          <img 
            src={friendPhoto || `https://ui-avatars.com/api/?name=${friendDisplayName}&background=random`} 
            alt="Avatar" 
            style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid var(--accent-primary, #e50914)" }} 
          />
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{friendDisplayName}</h2>
        </div>
        
        <button 
          className="btn-secondary" 
          onClick={() => setShowMenu(!showMenu)}
          style={{ padding: "8px 12px", fontSize: "1.1rem", borderRadius: "999px" }}
        >
          ⋮
        </button>

        {showMenu && (
          <div className="chat-action-menu">
            <button className="chat-action-btn" onClick={() => setIsViewingProfile(true)}>View Profile</button>
            <button className="chat-action-btn" onClick={handleReport}>Report User</button>
            <button className="chat-action-btn danger" onClick={handleBlock}>Block User</button>
            <button className="chat-action-btn" onClick={handleLeave}>Leave Chat</button>
          </div>
        )}
      </div>

      {isViewingProfile && friendDetails && (
        <div className="planner-modal glass-panel" style={{ bottom: "auto", top: "76px", maxHeight: "80vh", overflowY: "auto", zIndex: 1100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{friendDetails.displayName}'s Profile</h2>
            <button className="btn-secondary" onClick={() => setIsViewingProfile(false)}>Close</button>
          </div>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img 
              src={friendDetails.photoURL || `https://ui-avatars.com/api/?name=${friendDetails.displayName}&background=random`} 
              alt="Avatar" 
              style={{ width: "90px", height: "90px", borderRadius: "50%", border: "2px solid var(--accent-primary, #e50914)" }} 
            />
            <p style={{ fontStyle: "italic", marginTop: "10px", color: "var(--text-secondary, #a1a1aa)" }}>
              "{friendDetails.bio || "Looking for movie buddies."}"
            </p>
          </div>
          <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", fontSize: "1rem" }}>Favorite Films</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px", marginTop: "14px" }}>
            {friendDetails.selectedMovies?.map((movie) => (
              <div key={movie.id} style={{ borderRadius: "10px", overflow: "hidden", aspectRatio: "2/3" }}>
                <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="chat-messages glass-panel">
        {messages.length === 0 && !chatId && (
          <p style={{ textAlign: "center", color: "var(--text-secondary, #a1a1aa)", marginTop: "40px" }}>
            Loading conversation...
          </p>
        )}
        {messages.length === 0 && chatId && (
          <p style={{ textAlign: "center", color: "var(--text-secondary, #a1a1aa)", marginTop: "40px" }}>
            Start the conversation with {friendDisplayName}!
          </p>
        )}
        {messages.map((msg) => {
          const isSent = msg.senderId === user.uid;
          const photoURL = isSent ? user.photoURL : friendPhoto;
          
          if (msg.type === "event") {
             return (
               <div key={msg.id} className="event-card-wrapper">
                 <div className="event-card glass-panel">
                   <h3>{msg.eventDetails.title}</h3>
                   <p>Scheduled by {isSent ? "You" : friendDisplayName}</p>
                   <div className="event-time">
                     {new Date(msg.eventDetails.dateTime).toLocaleString()}
                   </div>
                 </div>
               </div>
             );
          }

          return (
            <div
              key={msg.id}
              className={`message-wrapper ${isSent ? "sent" : "received"}`}
            >
              {!isSent && (
                <img 
                  src={photoURL || `https://ui-avatars.com/api/?name=${friendDisplayName}&background=random`} 
                  className="chat-avatar" 
                  alt="Avatar" 
                />
              )}
              <div className="message-bubble">{msg.text}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {showPlanner && (
        <div className="planner-modal glass-panel">
          <h3 style={{ margin: "0 0 14px 0", fontSize: "1.05rem" }}>Schedule Movie Session</h3>
          <input 
            type="datetime-local" 
            value={eventDate} 
            onChange={(e) => setEventDate(e.target.value)} 
            className="chat-input"
            style={{ marginBottom: "14px", width: "100%" }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-secondary" onClick={() => setShowPlanner(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleScheduleEvent}>Send Invite</button>
          </div>
        </div>
      )}

      <div className="chat-input-area">
        <button 
          type="button" 
          className="btn-secondary plan-btn" 
          onClick={() => setShowPlanner(!showPlanner)}
          title="Schedule Movie Session"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        <form onSubmit={handleSend} style={{ flex: 1, display: "flex", gap: "12px" }}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send message..."
          />
          <button type="submit" className="btn-primary chat-send-btn">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}