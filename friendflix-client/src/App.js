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

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home"); // "home" | "select" | "selected" | "friendMatches"
  const [selectedMovies, setSelectedMovies] = useState(() => {
    const saved = localStorage.getItem("selectedMovies");
    return saved ? JSON.parse(saved) : [];
  });

  const [friendMatches, setFriendMatches] = useState([]);

  // Listen to auth changes
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

  // Save selected movies to localStorage & Firestore on change
  useEffect(() => {
    localStorage.setItem("selectedMovies", JSON.stringify(selectedMovies));
    if (user) {
      saveSelectedMovies(selectedMovies);
    }
  }, [selectedMovies, user]);

  // Fetch friend matches when user or selectedMovies changes
 useEffect(() => {
  async function fetchMatches() {
    if (user && selectedMovies.length) {
      const matches = await findFriendMatches(user.uid, selectedMovies);
      console.log('Matches received:', matches); // <-- Add this line for debugging
      setFriendMatches(matches);
    } else {
      setFriendMatches([]);
    }
  }
  fetchMatches();
}, [user, selectedMovies]);


  // Handlers
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
    <div style={{ maxWidth: 700, margin: "auto", padding: "1rem" }}>
      <header style={{ marginBottom: "1rem" }}>
        <h1>Friendflix</h1>
        {user ? (
          <div>
            Welcome, {user.displayName}{" "}
            <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={handleLogin}>Sign In with Google</button>
        )}
      </header>

      {!user && <p>Please sign in to continue.</p>}

      {user && page === "home" && (
        <>
          <p>Select movies to find friends with similar taste!</p>
          <button onClick={() => setPage("select")}>Select Movies</button>
          {selectedMovies.length > 0 && (
            <>
              <button
                onClick={() => setPage("selected")}
                style={{ marginLeft: 10 }}
              >
                View Selected Movies
              </button>
              <button
                onClick={() => setPage("friendMatches")}
                style={{ marginLeft: 10 }}
              >
                View Friend Matches
              </button>
            </>
          )}
        </>
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
        />
      )}
    </div>
  );
}
