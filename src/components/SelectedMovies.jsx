import React from "react";
import "./SelectedMovies.css";

export default function SelectedMovies({ movies, onBack }) {
  return (
    <div>
      <h2>Your Selected Movies</h2>
      <div className="movies-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-item">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
            />
            <div className="movie-title">{movie.title}</div>
          </div>
        ))}
      </div>
      <button onClick={onBack} style={{ marginTop: "1rem" }}>
        ← Back
      </button>
    </div>
  );
}
