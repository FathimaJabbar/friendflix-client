import React, { useState, useEffect, useRef } from "react";
import {
  createOrGetChat,
  listenToChatMessages,
  sendMessage,
} from "../firebase";
import "./Chat.css";

export default function Chat({ user, friend, onBack }) {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
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

    return () => {
      unsubscribePromise.then((unsub) => unsub && unsub());
    };
  }, [user, friend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault(); // Prevent page refresh if inside a form
    if (input.trim() === "" || !chatId) return;

    try {
      await sendMessage(chatId, user.uid, input.trim());
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Message failed to send. Your Firebase rules are blocking the messages subcollection!");
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <h2>{friend.displayName}</h2>
      </div>

      <div className="chat-messages glass-panel">
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
            Say hi to start the conversation!
          </p>
        )}
        {messages.map((msg) => {
          const isSent = msg.senderId === user.uid;
          return (
            <div
              key={msg.id}
              className={`message-wrapper ${isSent ? "sent" : "received"}`}
            >
              <div className="message-bubble">{msg.text}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
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
  );
}
