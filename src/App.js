
// src/App.js
import React, { useEffect, useState } from "react";
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  logout,
  saveSelectedMovies,
  findFriendMatches,
} from "./firebase";
import MovieSelector from "./components/MovieSelector";
import SelectedMovies from "./components/SelectedMovies";
import FriendMatches from "./components/FriendMatches";
import UserProfile from "./components/UserProfile";
import Chat from "./components/Chat";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home"); // "home" | "select" | "selected" | "friendMatches" | "profile" | "chat"
  const [selectedMovies, setSelectedMovies] = useState(() => {
    const saved = localStorage.getItem("selectedMovies");
    return saved ? JSON.parse(saved) : [];
  });

  const [friendMatches, setFriendMatches] = useState([]);
  const [chatUserId, setChatUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setSelectedMovies([]);
        setFriendMatches([]);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedMovies", JSON.stringify(selectedMovies));
    if (user) {
      saveSelectedMovies(selectedMovies);
    }
  }, [selectedMovies, user]);

  useEffect(() => {
    async function fetchMatches() {
      if (user && selectedMovies.length) {
        const matches = await findFriendMatches(user.uid, selectedMovies);
        setFriendMatches(matches);
      } else {
        setFriendMatches([]);
      }
    }
    fetchMatches();
  }, [user, selectedMovies]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      alert("Failed to sign in: " + error.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    setPage("home");
    setSelectedMovies([]);
    setFriendMatches([]);
  };

  const handleSelectionComplete = (movies) => {
    setSelectedMovies(movies);
    setPage("home");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="logo">FriendFlix</h1>
        {user ? (
          <div className="welcome-user">
            Welcome, {user.displayName}
            <button onClick={handleLogout}>Sign Out</button>
          </div>
        ) : (
          <button onClick={handleLogin} className="signin-button">Sign In with Google</button>
        )}
      </header>

      {!user && (
        <div className="landing">
          <h2>Welcome to FriendFlix</h2>
          <p>
            Discover movie-loving friends who share your cinematic tastes.
            Select your favorite movies and connect with like-minded souls.
          </p>
        </div>
      )}

      {user && page === "home" && (
        <div className="main-menu">
          <p>Select movies to find friends with similar taste!</p>
          <button onClick={() => setPage("select")}>🎬 Select Movies</button>
          {selectedMovies.length > 0 && (
            <>
              <button onClick={() => setPage("selected")}>📁 View Selected Movies</button>
              <button onClick={() => setPage("friendMatches")}>👥 View Friend Matches</button>
              <button onClick={() => setPage("profile")}>🧑‍💼 Your Profile</button>
              <button onClick={() => setPage("chat")}>💬 Chat</button>
            </>
          )}
        </div>
      )}

      {page === "select" && (
        <MovieSelector
          onSelectionComplete={handleSelectionComplete}
          initialSelected={selectedMovies}
        />
      )}

      {page === "selected" && (
        <SelectedMovies movies={selectedMovies} onBack={() => setPage("home")} />
      )}

      {page === "friendMatches" && (
        <FriendMatches
          matches={friendMatches}
          onBack={() => setPage("home")}
          onStartChat={(id) => {
            setChatUserId(id);
            setPage("chat");
          }}
        />
      )}

      {page === "profile" && (
        <UserProfile user={user} onBack={() => setPage("home")} />
      )}

      {page === "chat" && (
        <Chat currentUser={user} chatUserId={chatUserId} onBack={() => setPage("home")} />
      )}
       <footer style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem" }}>
  Made with 💖 for Movie lovers by Fathima Jabbar
</footer>
    </div>
  );
}
