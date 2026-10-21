import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
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

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || "96d6e812cf355a07e7026acbd3cd93cb";

export default function App() {
  const [user,              setUser]              = useState(null);
  const [page,              setPage]              = useState("home");
  const [selectedMovies,    setSelectedMovies]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("selectedMovies")) || []; }
    catch { return []; }
  });
  const [friendMatches,     setFriendMatches]     = useState([]);
  const [trendingMovies,    setTrendingMovies]    = useState([]);
  const [topRatedMovies,    setTopRatedMovies]    = useState([]);
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

  /* ── Fetch Real Movies for Front Page ── */
  useEffect(() => {
    axios
      .get(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1`)
      .then((res) => setTrendingMovies(res.data.results || []))
      .catch(console.error);

    axios
      .get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&page=1`)
      .then((res) => setTopRatedMovies(res.data.results || []))
      .catch(console.error);
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
          const chatName = chat.name || (chat.isCustomGroup ? "Group" : "Direct Message");
          setNotification(`${chatName}: ${chat.lastMessage}`);
        }
        prevChatsRef.current[chat.id] = lastTime;
      });
    });
    return () => unsub();
  }, [user]);

  /* ── Save movies to localStorage and Firestore ── */
  useEffect(() => {
    localStorage.setItem("selectedMovies", JSON.stringify(selectedMovies));
    if (user) saveSelectedMovies(selectedMovies).catch(console.error);
  }, [selectedMovies, user]);

  /* ── Fetch matches from Firestore ── */
  useEffect(() => {
    if (user && selectedMovies.length) {
      findFriendMatches(user.uid, selectedMovies)
        .then(setFriendMatches)
        .catch(console.error);
    } else {
      setFriendMatches([]);
    }
  }, [user, selectedMovies, refreshTrigger]);

  const handleLogin  = () => signInWithGoogle().catch((e) => alert("Sign-in failed: " + e.message));
  // eslint-disable-next-line no-unused-vars
  const handleLogout = async () => {
    await logout();
    setPage("home"); setSelectedMovies([]); setFriendMatches([]);
    setActiveChatFriend(null); setActiveGroupLounge(null); setActiveCustomGroup(null);
  };

  /* ── Dynamic Move to Library (Instantly removes from recommendation rails) ── */
  const handleAddMovie = (movie) => {
    const alreadySelected = selectedMovies.some((m) => String(m.id) === String(movie.id));
    if (!alreadySelected) {
      setSelectedMovies((prev) => [movie, ...prev]);
      setNotification(`Added "${movie.title}" to your library.`);
    }
  };

  /* Normalizes both friend.uid and friend.userId to prevent undefined chat document paths */
  const openPrivateChat = (friend) => {
    setActiveChatFriend({
      uid: friend.uid || friend.userId,
      displayName: friend.displayName || "Friend",
      photoURL: friend.photoURL || "",
    });
    setPage("chat");
  };

  const openGroupLounge = (movie)  => { setActiveGroupLounge(movie); setPage("groupChatLounge"); };
  const openCustomGroup = (group)  => { setActiveCustomGroup(group); setPage("groupChatCustom"); };

  const navigate = (target) => {
    if (target !== "chat") setActiveChatFriend(null);
    if (target !== "groupChatLounge") setActiveGroupLounge(null);
    if (target !== "groupChatCustom") setActiveCustomGroup(null);
    setPage(target);
  };

  const heroMovie = selectedMovies[0] || trendingMovies[0] || {
    title: "Interstellar",
    backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  };

  /* Exclude movies already in library so they immediately vacate recommendation rails */
  const visibleTrending = trendingMovies.filter(
    (movie) => !selectedMovies.some((m) => String(m.id) === String(movie.id))
  );

  const visibleTopRated = topRatedMovies.filter(
    (movie) => !selectedMovies.some((m) => String(m.id) === String(movie.id))
  );

  return (
    <div className="app-container">
      {/* ── App Header ── */}
      <header className="app-header">
        <div className="brand-group" onClick={() => navigate("home")}>
          <span className="brand-pillar"></span>
          <h1 className="logo">FRIENDFLIX</h1>
        </div>

        {user ? (
          <div className="header-right">
            <button className="icon-btn-header" onClick={() => navigate("inbox")} title="Direct Messages">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </button>
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
              alt="Avatar"
              className="header-avatar"
              onClick={() => navigate("profile")}
              title="Your Profile"
            />
            <button className="signout-btn" onClick={handleLogout} title="Sign Out">
              Sign Out
            </button>
          </div>
        ) : (
          <button className="signin-button" onClick={handleLogin}>Sign In</button>
        )}
      </header>

      <Toast message={notification} onClose={() => setNotification(null)} />

      {/* ── Landing Page ── */}
      {!user && (
        <div className="landing">
          <div className="landing-badge">CINEMATIC SOCIAL NETWORK</div>
          <h2 className="landing-title">
            Watch together. <br /><span className="accent">Match through cinema.</span>
          </h2>
          <p className="landing-subtitle">
            Match with people who share your film DNA, jump into real-time fan lounges, and coordinate screenings seamlessly.
          </p>
          <button className="landing-cta" onClick={handleLogin}>
            Sign In with Google
          </button>
        </div>
      )}

      {/* ── Post-Login Dashboard ── */}
      {user && page === "home" && (
        <div className="home-dashboard">
          
          {/* Top Matches Tray */}
          <div className="stories-section">
            <div className="section-header">
              <h3>Taste Matches</h3>
              <span className="section-link" onClick={() => navigate("friendMatches")}>
                View All ({friendMatches.length})
              </span>
            </div>

            <div className="stories-scroll">
              {friendMatches.length === 0 ? (
                <div className="empty-story-pill" onClick={() => navigate("select")}>
                  <div className="add-plus">+</div>
                  <span>Pick 3 films to unlock your matches</span>
                </div>
              ) : (
                friendMatches.map((friend) => (
                  <div 
                    key={friend.userId || friend.uid} 
                    className="story-item"
                    onClick={() => openPrivateChat(friend)}
                  >
                    <div className="avatar-ring">
                      <img 
                        src={friend.photoURL || `https://ui-avatars.com/api/?name=${friend.displayName}&background=random`} 
                        alt={friend.displayName} 
                      />
                      <span className="match-tag">{friend.matchPercentage}%</span>
                    </div>
                    <span className="story-label">{friend.displayName?.split(" ")[0]}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Large Hero Cinema Billboard */}
          <div className="cinema-hero">
            <div 
              className="hero-backdrop" 
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w1280${heroMovie.backdrop_path || heroMovie.poster_path})`
              }}
            >
              <div className="hero-gradient-overlay" />
            </div>

            <div className="hero-details">
              <span className="hero-eyebrow">HEADLINE FILM</span>
              <h2 className="hero-title">{heroMovie.title}</h2>
              <p className="hero-desc">{heroMovie.overview}</p>
              
              <div className="hero-btn-row">
                <button className="btn-primary" onClick={() => navigate("swiper")}>
                  Start Swiping
                </button>
                <button className="btn-secondary" onClick={() => openGroupLounge(heroMovie)}>
                  Enter Lounge
                </button>
              </div>
            </div>
          </div>

          {/* Rail 1: User's Library */}
          <div className="rail-section">
            <div className="section-header">
              <h3>Your Library ({selectedMovies.length})</h3>
              <span className="section-link" onClick={() => navigate("select")}>
                + Search Titles
              </span>
            </div>

            {selectedMovies.length === 0 ? (
              <div className="empty-rail-placeholder" onClick={() => navigate("select")}>
                <p>Tap + Add on any movie below or search to build your library.</p>
              </div>
            ) : (
              <div className="poster-scroll-rail">
                {selectedMovies.map((movie) => (
                  <div 
                    key={movie.id} 
                    className="rail-poster-card" 
                    onClick={() => openGroupLounge(movie)}
                  >
                    <img 
                      src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} 
                      alt={movie.title} 
                    />
                    <div className="poster-meta">
                      <span className="live-indicator">LOUNGE</span>
                      <h5>{movie.title}</h5>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rail 2: Trending (Disappears dynamically once added) */}
          {visibleTrending.length > 0 && (
            <div className="rail-section">
              <div className="section-header">
                <h3>Trending Movies</h3>
                <span className="section-link" onClick={() => navigate("swiper")}>
                  Swipe All
                </span>
              </div>

              <div className="poster-scroll-rail">
                {visibleTrending.slice(0, 12).map((movie) => (
                  <div 
                    key={movie.id} 
                    className="rail-poster-card" 
                    onClick={() => handleAddMovie(movie)}
                  >
                    <img 
                      src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} 
                      alt={movie.title} 
                    />
                    <div className="poster-meta">
                      <span className="add-badge">+ Add</span>
                      <h5>{movie.title}</h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rail 3: Top Rated (Disappears dynamically once added) */}
          {visibleTopRated.length > 0 && (
            <div className="rail-section">
              <div className="section-header">
                <h3>Top Rated Films</h3>
                <span className="section-link" onClick={() => navigate("select")}>
                  Search All
                </span>
              </div>

              <div className="poster-scroll-rail">
                {visibleTopRated.slice(0, 12).map((movie) => (
                  <div 
                    key={movie.id} 
                    className="rail-poster-card" 
                    onClick={() => handleAddMovie(movie)}
                  >
                    <img 
                      src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} 
                      alt={movie.title} 
                    />
                    <div className="poster-meta">
                      <span className="score-badge">{Math.round(movie.vote_average * 10)}%</span>
                      <h5>{movie.title}</h5>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Hub Links */}
          <div className="action-cards-grid">
            <div className="action-tile" onClick={() => navigate("lounges")}>
              <span className="tile-category">COMMUNITY</span>
              <h4>Movie Lounges</h4>
              <p>Discuss the films in your library with other active viewers.</p>
            </div>
            <div className="action-tile" onClick={() => navigate("userGroups")}>
              <span className="tile-category">CIRCLES</span>
              <h4>Friend Groups</h4>
              <p>Form private watch circles and plan upcoming sessions.</p>
            </div>
          </div>

        </div>
      )}

      {page === "select" && (
        <MovieSelector
          onSelectionComplete={(movies) => { setSelectedMovies(movies); navigate("home"); }}
          initialSelected={selectedMovies}
          onBack={() => navigate("home")}
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
          chatName={activeGroupLounge.title + " Lounge"}
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
        <MovieSwiper onAddMovie={handleAddMovie} onBack={() => navigate("home")} />
      )}

      {page === "selected" && (
        <SelectedMovies movies={selectedMovies} onBack={() => navigate("home")} />
      )}

      {user && <Navbar page={page} onNavigate={navigate} />}
    </div>
  );
}