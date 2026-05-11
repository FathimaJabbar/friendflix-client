import React, { useState, useEffect, useRef } from "react";
import {
  listenToGroupMessages,
  sendGroupMessage,
} from "../firebase";
import "./GroupChat.css";
import "./Chat.css"; // Reuse chat styles for planner and events

export default function GroupChat({ user, chatId, chatName, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showPlanner, setShowPlanner] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user || !chatId) return;

    const unsubscribe = listenToGroupMessages(chatId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (input.trim() === "" || !chatId) return;

    try {
      await sendGroupMessage(chatId, user.uid, user.displayName, input.trim(), "text", null, user.photoURL);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Message failed to send. Check Firebase permissions.");
    }
  }

  const handleScheduleEvent = async () => {
    if (!eventDate) return;
    try {
      await sendGroupMessage(chatId, user.uid, user.displayName, "", "event", {
        title: "Group Movie Night 🍿",
        dateTime: eventDate
      }, user.photoURL);
      setShowPlanner(false);
      setEventDate("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="group-chat-container">
      <div className="chat-header glass-panel" style={{ padding: "15px 25px", borderRadius: "20px" }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.8rem" }}>{chatName}</h2>
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Group Chat
          </span>
        </div>
        <div style={{ width: "80px" }}></div>
      </div>

      <div className="chat-messages glass-panel">
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "20px" }}>
            Welcome to {chatName}! Be the first to say hi!
          </p>
        )}
        {messages.map((msg) => {
          const isSent = msg.senderId === user.uid;

          if (msg.type === "event") {
             return (
               <div key={msg.id} className="event-card-wrapper">
                 <div className="event-card glass-panel">
                   <h3>{msg.eventDetails.title}</h3>
                   <p>Scheduled by {isSent ? "You" : msg.senderName}</p>
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
                  src={msg.senderPhoto || `https://ui-avatars.com/api/?name=${msg.senderName}&background=random`} 
                  className="chat-avatar" 
                  alt="Avatar" 
                  style={{ alignSelf: "flex-end", marginBottom: "10px" }}
                />
              )}
              <div className="message-bubble-wrapper">
                {!isSent && <div className="sender-name">{msg.senderName || "Unknown User"}</div>}
                <div className="message-bubble">{msg.text}</div>
              </div>
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
