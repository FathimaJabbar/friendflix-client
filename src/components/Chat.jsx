import React, { useState, useEffect } from "react";
import {
  createOrGetChat,
  listenToChatMessages,
  sendMessage,
} from "../firebase";

export default function Chat({ user, friend }) {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

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

  async function handleSend() {
    if (input.trim() === "" || !chatId) return;

    await sendMessage(chatId, user.uid, input.trim());
    setInput("");
  }

  return (
    <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", height: "80vh" }}>
      <h2>Chat with {friend.displayName}</h2>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.senderId === user.uid ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 15,
                backgroundColor: msg.senderId === user.uid ? "#4caf50" : "#ddd",
                color: msg.senderId === user.uid ? "white" : "black",
                maxWidth: "70%",
                wordWrap: "break-word",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
        />
        <button onClick={handleSend} style={{ marginLeft: 10, padding: "10px 15px" }}>
          Send
        </button>
      </div>
    </div>
  );
}
