import React from "react";
import "./Navbar.css";

const Icons = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  ),
  swiper: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="3" />
      <path d="M12 14l3-3-3-3-3 3 3 3z" />
    </svg>
  ),
  friendMatches: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  inbox: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  lounges: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  profile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: "home",          label: "Home"    },
  { id: "swiper",        label: "Discover"},
  { id: "friendMatches", label: "Matches" },
  { id: "inbox",         label: "Direct"  },
  { id: "lounges",       label: "Lounges" },
  { id: "profile",       label: "Profile" },
];

const CHAT_PAGES = ["chat", "groupChatLounge", "groupChatCustom"];

export default function Navbar({ page, onNavigate }) {
  const isChatPage = CHAT_PAGES.includes(page);

  return (
    <nav className={`bottom-nav ${isChatPage ? "hidden" : ""}`}>
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const isActive =
            page === item.id ||
            (item.id === "inbox" && page === "chat") ||
            (item.id === "lounges" && page === "groupChatLounge");

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{Icons[item.id]}</span>
              <span className="nav-label">{item.label}</span>
              {isActive && <span className="nav-indicator" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}