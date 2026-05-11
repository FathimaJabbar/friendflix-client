import React, { useEffect, useState, useRef } from "react";
import {
  auth, onAuthStateChanged, signInWithGoogle, logout,
  saveSelectedMovies, findFriendMatches, listenToAllUserChats,
} from "./firebase";
import MovieSelector   from "./components/MovieSelector";
import SelectedMovies  from "./components/SelectedMovies";
import FriendMatches   from "./components/FriendMatches";
import UserProfile     from "./components/UserProfile";
import Chat            from "./components/Chat";
import MovieLounges    from "./components/MovieLounges";
import GroupChat       from "./components/GroupChat";
import MovieSwiper     from "./components/MovieSwiper";
import CreateGroup     from "./components/CreateGroup";
import UserGroups      from "./components/UserGroups";
import Toast           from "./components/Toast";
import Navbar          from "./components/Navbar";
import Inbox           from "./components/Inbox";
import "./App.css";

export default function App() {
  const [user,              setUser]              = useState(null);
  const [page,              setPage]              = useState("home");
  const [selectedMovies,    setSelectedMovies]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("selectedMovies")) || []; }
    catch { return []; }
  });
  const [friendMatches,     setFriendMatches]     = useState([]);
  const [activeChatFriend,  setActiveChatFriend]  = useState(null);
  const [activeGroupLounge, setActiveGroupLounge] = useState(null);
  const [activeCustomGroup, setActiveCustomGroup] = useState(null);
  const [refreshTrigger,    setRefreshTrigger]    = useState(0);
  const [notification,      setNotification]      = useState(null);
  const prevChatsRef = useRef({});

  /* ── Auth ── */
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) { setSelectedMovies([]); setFriendMatches([]); }
    });
  }, []);

  /* ── Notification listener ── */
  useEffect(() => {
    if (!user) { prevChatsRef.current = {}; return; }
    const unsub = listenToAllUserChats(user.uid, (chats) => {
      chats.forEach((chat) => {
        if (!chat.lastMessageTime || !chat.lastSenderId) return;
        if (chat.lastSenderId === user.uid) {
          prevChatsRef.current[chat.id] = chat.lastMessageTime.toMillis?.() || 0;
          return;
        }
        const lastTime = chat.lastMessageTime.toMillis?.() || 0;
        const prevTime = prevChatsRef.current[chat.id];
        if (prevTime && lastTime > prevTime) {
          const chatName = chat.name || (chat.isCustomGroup ? "Group" : "Friend");
          setNotification(`${chatName}: ${chat.lastMessage}`);
        }
        prevChatsRef.current[chat.id] = lastTime;
      });
    });
    return () => unsub();
  }, [user]);

  /* ── Save movies ── */
  useEffect(() => {
    localStorage.setItem("selectedMovies", JSON.stringify(selectedMovies));
    if (user) saveSelectedMovies(selectedMovies).catch(console.error);
  }, [selectedMovies, user]);

  /* ── Fetch matches ── */
  useEffect(() => {
    if (user && selectedMovies.length) {
      findFriendMatches(user.uid, selectedMovies)
        .then(setFriendMatches)
        .catch(console.error);
    } else {
      setFriendMatches([]);
    }
  }, [user, selectedMovies, refreshTrigger]);

  /* ── Helpers ── */
  const handleLogin  = () => signInWithGoogle().catch((e) => alert("Sign-in failed: " + e.message));
  const handleLogout = async () => {
    await logout();
    setPage("home"); setSelectedMovies([]); setFriendMatches([]);
    setActiveChatFriend(null); setActiveGroupLounge(null); setActiveCustomGroup(null);
  };
  const addSwipedMovie = (movie) =>
    setSelectedMovies((prev) => prev.find((m) => m.id === movie.id) ? prev : [...prev, movie]);

  const openPrivateChat = (friend) => { setActiveChatFriend(friend); setPage("chat"); };
  const openGroupLounge = (movie)  => { setActiveGroupLounge(movie); setPage("groupChatLounge"); };
  const openCustomGroup = (group)  => { setActiveCustomGroup(group); setPage("groupChatCustom"); };

  const navigate = (target) => {
    // reset chat state when leaving chat pages
    if (target !== "chat") setActiveChatFriend(null);
    if (target !== "groupChatLounge") setActiveGroupLounge(null);
    if (target !== "groupChatCustom") setActiveCustomGroup(null);
    setPage(target);
  };

  /* ── Render ── */
  return (
    <div className="app-container">
      {/* ── Header ── */}
      <header className="app-header">
        <h1 className="logo" onClick={() => navigate("home")} style={{ cursor: "pointer" }}>
          FriendFlix
        </h1>
        {user ? (
          <div className="header-right">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
              alt="avatar"
              className="header-avatar"
              onClick={() => navigate("profile")}
              title="Your Profile"
            />
            <button className="signout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        ) : (
          <button className="signin-button" onClick={handleLogin}>Sign In</button>
        )}
      </header>

      <Toast message={notification} onClose={() => setNotification(null)} />

      {/* ── Pages ── */}
      {!user && (
        <div className="landing">
          <div className="landing-eyebrow">🎬 Find your movie tribe</div>
          <h2 className="landing-title">
            Make friends through<br /><span className="accent">movies you love</span>
          </h2>
          <p className="landing-subtitle">
            FriendFlix matches you with people who share your cinematic taste — then gives you lounges, group chats, and more to connect.
          </p>
          <button className="landing-cta" onClick={handleLogin}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/480px-Google_%22G%22_logo.svg.png" alt="G" />
            Continue with Google
          </button>
          <div className="landing-features">
            {["🎯 Smart Matching","💬 Group Chats","🛋️ Movie Lounges","🔥 Swipe Mode","📅 Movie Nights","🔔 Live Alerts"].map((f) => (
              <div key={f} className="feature-pill">{f}</div>
            ))}
          </div>
        </div>
      )}

      {user && page === "home" && (
        <div className="home-dashboard">
          <div className="dashboard-greeting">
            <h2>Hey, {user.displayName?.split(" ")[0]} 👋</h2>
            <p>Ready to find your next movie buddy?</p>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number">{selectedMovies.length}</div>
              <div className="stat-label">Movies</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{friendMatches.length}</div>
              <div className="stat-label">Matches</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{selectedMovies.length}</div>
              <div className="stat-label">Lounges</div>
            </div>
          </div>

          <p className="section-label">Discover</p>
          <div className="feature-grid">
            <div className="fcard fire" onClick={() => navigate("swiper")}>
              <div className="fcard-icon">🔥</div>
              <p className="fcard-title">Swipe Mode</p>
              <p className="fcard-desc">Discover movies by swiping</p>
            </div>
            <div className="fcard ocean" onClick={() => navigate("select")}>
              <div className="fcard-icon">🎬</div>
              <p className="fcard-title">Select Movies</p>
              <p className="fcard-desc">Search & pick your favs</p>
            </div>
          </div>

          <p className="section-label">Social</p>
          <div className="feature-grid">
            <div className="fcard gold" onClick={() => navigate("friendMatches")}>
              <div className="fcard-icon">✨</div>
              <p className="fcard-title">Friend Matches</p>
              <p className="fcard-desc">{friendMatches.length} people match your taste</p>
            </div>
            <div className="fcard glass-card" onClick={() => navigate("inbox")}>
              <div className="fcard-icon">💬</div>
              <p className="fcard-title">My Chats</p>
              <p className="fcard-desc">All your conversations</p>
            </div>
            <div className="fcard aurora" onClick={() => navigate("userGroups")}>
              <div className="fcard-icon">👥</div>
              <p className="fcard-title">Friend Groups</p>
              <p className="fcard-desc">Private group chats</p>
            </div>
            <div className="fcard emerald" onClick={() => navigate("lounges")}>
              <div className="fcard-icon">🎬</div>
              <p className="fcard-title">Movie Lounges</p>
              <p className="fcard-desc">Public fan club chats</p>
            </div>
          </div>
        </div>
      )}

      {page === "select" && (
        <MovieSelector
          onSelectionComplete={(movies) => { setSelectedMovies(movies); navigate("home"); }}
          initialSelected={selectedMovies}
        />
      )}

      {page === "friendMatches" && (
        <FriendMatches
          matches={friendMatches}
          onBack={() => navigate("home")}
          onStartChat={(friend) => openPrivateChat(friend)}
        />
      )}

      {page === "profile" && user && (
        <UserProfile user={user} selectedMovies={selectedMovies} onBack={() => navigate("home")} />
      )}

      {page === "inbox" && user && (
        <Inbox
          user={user}
          matches={friendMatches}
          onOpenPrivateChat={(friend) => openPrivateChat(friend)}
          onOpenGroupChat={(group) => openCustomGroup(group)}
        />
      )}

      {page === "chat" && user && activeChatFriend && (
        <Chat
          user={user}
          friend={activeChatFriend}
          onBack={() => navigate("inbox")}
          onBlockSuccess={() => {
            setRefreshTrigger((p) => p + 1);
            setActiveChatFriend(null);
            navigate("friendMatches");
          }}
        />
      )}

      {page === "lounges" && (
        <MovieLounges
          selectedMovies={selectedMovies}
          onBack={() => navigate("home")}
          onJoinLounge={(movie) => openGroupLounge(movie)}
        />
      )}

      {page === "groupChatLounge" && user && activeGroupLounge && (
        <GroupChat
          user={user}
          chatId={"group_" + activeGroupLounge.id}
          chatName={activeGroupLounge.title + " Fan Club"}
          onBack={() => navigate("lounges")}
        />
      )}

      {page === "groupChatCustom" && user && activeCustomGroup && (
        <GroupChat
          user={user}
          chatId={activeCustomGroup.id}
          chatName={activeCustomGroup.name}
          onBack={() => navigate("userGroups")}
        />
      )}

      {page === "userGroups" && user && (
        <UserGroups
          user={user}
          onBack={() => navigate("home")}
          onCreateNew={() => navigate("createGroup")}
          onJoinGroup={(group) => openCustomGroup(group)}
        />
      )}

      {page === "createGroup" && user && (
        <CreateGroup
          user={user}
          matches={friendMatches}
          onBack={() => navigate("userGroups")}
          onSuccess={(id, name) => { openCustomGroup({ id, name }); }}
        />
      )}

      {page === "swiper" && (
        <MovieSwiper onAddMovie={addSwipedMovie} onBack={() => navigate("home")} />
      )}

      {page === "selected" && (
        <SelectedMovies movies={selectedMovies} onBack={() => navigate("home")} />
      )}

      {user && <Navbar page={page} onNavigate={navigate} />}

      <footer className="app-footer">
        <p>© 2025 FriendFlix · Built with ❤️ by Fathima Jabbar</p>
      </footer>
    </div>
  );
}
