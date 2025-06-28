import React from "react";

export default function UserProfile({ user, selectedMovies = [], onBack }) {
  return (
    <div className="user-profile-container">
      <button onClick={onBack}>← Back</button>
      <h2>{user.displayName}'s Profile</h2>
      <h3>Selected Movies:</h3>
      {selectedMovies.length === 0 ? (
        <p>No movies selected.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {selectedMovies.map((movie) => (
            <li
              key={movie.id}
              style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                alt={movie.title}
                style={{ marginRight: "10px", borderRadius: "5px" }}
              />
              <span>{movie.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

