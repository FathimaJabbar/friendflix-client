import React, { useEffect, useState } from "react";
import { auth, createOrGetChat, sendMessage, listenToChatMessages } from "../firebase";

const ADMIN_ID = "jPvC75Bb8tZ4OJHPPXiu2tYJaVJ2";

export default function Chat({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserId) return;

    const setupChat = async () => {
      const chatRef = await createOrGetChat(currentUserId, ADMIN_ID);
      listenToChatMessages(chatRef, setMessages);
    };

    setupChat();
  }, [currentUserId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const chatRef = await createOrGetChat(currentUserId, ADMIN_ID);
    await sendMessage(chatRef, currentUserId, input);
    setInput("");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2 className="text-lg font-bold mb-4">
You’re chatting with Fathima Jabbar 
</h2>

      <button onClick={onBack}> ← Back</button>
      <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "1rem" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "0.5rem" }}>
            <strong>{msg.sender === currentUserId ? "You" : "Fathima Jabbar"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <button onClick={handleSend} style={{ marginLeft: "0.5rem" }}>
          Send
        </button>
      </div>
    </div>
  );
}
