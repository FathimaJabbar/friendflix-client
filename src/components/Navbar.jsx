import React from "react";
import "./Navbar.css";

const NAV_ITEMS = [
  { id: "home",         icon: "🏠", label: "Home"     },
  { id: "friendMatches",icon: "✨", label: "Matches"  },
  { id: "inbox",        icon: "💬", label: "Chats"    },
  { id: "lounges",      icon: "🎬", label: "Lounges"  },
  { id: "profile",      icon: "👤", label: "Profile"  },
];

const CHAT_PAGES = ["chat", "groupChatLounge", "groupChatCustom"];

export default function Navbar({ page, onNavigate }) {
  const isChatPage = CHAT_PAGES.includes(page);

  return (
    <nav className={`bottom-nav ${isChatPage ? "hidden" : ""}`}>
      {NAV_ITEMS.map((item) => {
        const isActive = page === item.id ||
          (item.id === "inbox" && page === "chat") ||
          (item.id === "lounges" && (page === "groupChatLounge"));

        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {isActive && <span className="nav-dot" />}
          </button>
        );
      })}
    </nav>
  );
}
