import React from "react";
import "./SelectedMovies.css";

export default function SelectedMovies({ movies, onBack }) {
  return (
    <div className="selected-movies-container page-wrapper">
      <div className="selected-header">
        <button className="nav-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </button>
        <div>
          <h2>Your Collection</h2>
          <p>{movies.length} films curated in your library</p>
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="empty-state">
          <h3>Your library is empty</h3>
          <p>Add films from discovery or search to view them here.</p>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-item glass-card">
              <img
                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                alt={movie.title}
              />
              <div className="movie-title">{movie.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}