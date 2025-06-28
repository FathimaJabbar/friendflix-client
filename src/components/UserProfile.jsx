import React from "react";

export default function UserProfile({ user, selectedMovies, onBack }) {
  return (
    <div>
      <h2>User Profile</h2>
      <p>
        <strong>Name:</strong> {user.displayName}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <h3>Selected Movies:</h3>
      {selectedMovies.length === 0 ? (
        <p>No movies selected.</p>
      ) : (
        <ul>
          {selectedMovies.map((movie) => (
            <li key={movie.id}>{movie.title}</li>
          ))}
        </ul>
      )}
      <button onClick={onBack} style={{ marginTop: 20 }}>
        ← Back
      </button>
    </div>
  );
}
