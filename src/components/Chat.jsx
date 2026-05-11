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
    if (!user || !friend) return;

    async function setupChat() {
      const id = await createOrGetChat(user.uid, friend.uid);
      setChatId(id);

      const unsubscribe = listenToChatMessages(id, (msgs) => {
        setMessages(msgs);
      });

      return unsubscribe;
    }

    const unsubscribePromise = setupChat();

    // Fetch friend details for profile view
    const fetchFriendDetails = async () => {
      const docSnap = await getDoc(doc(db, "users", friend.uid));
      if (docSnap.exists()) {
        setFriendDetails(docSnap.data());
      }
    };
    fetchFriendDetails();

    return () => {
      unsubscribePromise.then((unsub) => unsub && unsub());
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
      alert("Message failed to send. Your Firebase rules are blocking the messages subcollection!");
    }
  }

  const handleBlock = async () => {
    if (window.confirm(`Are you sure you want to block ${friend.displayName}? They will be permanently removed from your matches.`)) {
      try {
        await blockUser(user.uid, friend.uid);
        alert("User blocked successfully.");
        if (onBlockSuccess) onBlockSuccess();
      } catch (err) {
        console.error(err);
        alert("Failed to block user. You might need to update your Firebase rules to allow writes to your own user document.");
      }
    }
  };

  const handleReport = async () => {
    const reason = window.prompt(`Why are you reporting ${friend.displayName}?`);
    if (reason && reason.trim() !== "") {
      try {
        await reportUser(user.uid, friend.uid, reason);
        alert("Report submitted successfully. Our team will review it.");
        setShowMenu(false);
      } catch (err) {
        console.error(err);
        alert("Failed to submit report. Please check Firebase permissions for the 'reports' collection.");
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
        title: "Movie Night 🍿",
        dateTime: eventDate
      }, user.photoURL);
      setShowPlanner(false);
      setEventDate("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header glass-panel" style={{ 
        position: "relative", 
        padding: "15px 25px", 
        borderRadius: "20px", 
        background: "rgba(10,10,20,0.92)", 
        border: "1px solid rgba(255,255,255,0.15)",
        zIndex: 1000 // Higher than messages
      }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <div 
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", cursor: "pointer" }}
          onClick={() => setIsViewingProfile(true)}
          title="View Profile"
        >
          <img 
            src={friend.photoURL || `https://ui-avatars.com/api/?name=${friend.displayName}&background=random`} 
            alt="Avatar" 
            style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(0,198,255,0.5)" }} 
          />
          <h2 style={{ margin: 0 }}>{friend.displayName}</h2>
        </div>
        
        <button 
          className="btn-secondary" 
          onClick={() => setShowMenu(!showMenu)}
          style={{ padding: "10px 15px", fontSize: "1.2rem", borderRadius: "50%" }}
        >
          ⋮
        </button>

        {showMenu && (
          <div className="chat-action-menu">
            <button className="chat-action-btn" onClick={() => setIsViewingProfile(true)}>👤 View Profile</button>
            <button className="chat-action-btn" onClick={handleReport}>🚩 Report User</button>
            <button className="chat-action-btn danger" onClick={handleBlock}>🚫 Block User</button>
            <button className="chat-action-btn" onClick={handleLeave}>🚪 Leave Chat</button>
          </div>
        )}
      </div>

      {isViewingProfile && friendDetails && (
        <div className="planner-modal glass-panel" style={{ bottom: "auto", top: "80px", maxHeight: "80vh", overflowY: "auto", zIndex: 1100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>{friendDetails.displayName}'s Profile</h2>
            <button className="btn-secondary" onClick={() => setIsViewingProfile(false)}>Close</button>
          </div>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img 
              src={friendDetails.photoURL || `https://ui-avatars.com/api/?name=${friendDetails.displayName}&background=random`} 
              alt="Avatar" 
              style={{ width: "100px", height: "100px", borderRadius: "50%", border: "3px solid var(--accent-start)" }} 
            />
            <p style={{ fontStyle: "italic", marginTop: "10px" }}>"{friendDetails.bio || "No bio yet"}"</p>
          </div>
          <h3 style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>Favorite Movies</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px", marginTop: "15px" }}>
            {friendDetails.selectedMovies?.map(movie => (
              <div key={movie.id} style={{ borderRadius: "10px", overflow: "hidden" }}>
                <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} style={{ width: "100%", display: "block" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="chat-messages glass-panel">
        {messages.length === 0 && !chatId && (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "40px" }}>
            Loading messages...
          </p>
        )}
        {messages.length === 0 && chatId && (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "40px" }}>
            Say hi to start the conversation!
          </p>
        )}
        {messages.map((msg) => {
          const isSent = msg.senderId === user.uid;
          const photoURL = isSent ? user.photoURL : friend.photoURL;
          
          if (msg.type === "event") {
             return (
               <div key={msg.id} className="event-card-wrapper">
                 <div className="event-card glass-panel">
                   <h3>{msg.eventDetails.title}</h3>
                   <p>Scheduled by {isSent ? "You" : friend.displayName}</p>
                   <div className="event-time">
                     📅 {new Date(msg.eventDetails.dateTime).toLocaleString()}
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
                  src={photoURL || `https://ui-avatars.com/api/?name=${friend.displayName}&background=random`} 
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
          <h3>Schedule Movie Night 📅</h3>
          <input 
            type="datetime-local" 
            value={eventDate} 
            onChange={e => setEventDate(e.target.value)} 
            className="chat-input"
            style={{ marginBottom: "15px", width: "100%" }}
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
          title="Plan Movie Night"
        >
          📅
        </button>
        <form onSubmit={handleSend} style={{ flex: 1, display: "flex", gap: "15px" }}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
          />
          <button type="submit" className="btn-primary chat-send-btn">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
