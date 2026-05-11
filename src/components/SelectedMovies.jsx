import React from "react";
import "./SelectedMovies.css";

export default function SelectedMovies({ movies, onBack }) {
  return (
    <div className="selected-movies-container page-wrapper">
      <div className="selector-top" style={{ marginBottom: "20px" }}>
        <h2>Your Library 🎬</h2>
      </div>
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
      <button className="btn-secondary" onClick={onBack} style={{ marginTop: "2rem" }}>
        ← Back
      </button>
    </div>
  );
}
