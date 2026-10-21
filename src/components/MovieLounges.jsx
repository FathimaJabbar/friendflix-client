import React from "react";
import "./MovieLounges.css";

export default function MovieLounges({ selectedMovies, onJoinLounge, onBack }) {
  return (
    <div className="lounges-container page-wrapper">
      <div className="lounges-header">
        <button className="nav-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </button>
        <div>
          <h2>Movie Lounges</h2>
          <p>Real-time discussion clubs based on your library</p>
        </div>
      </div>

      {selectedMovies.length === 0 ? (
        <div className="empty-state">
          <h3>No lounges unlocked yet</h3>
          <p>Add films to your library to unlock their dedicated live chatrooms.</p>
        </div>
      ) : (
        <div className="lounges-grid">
          {selectedMovies.map((movie) => (
            <div key={movie.id} className="lounge-card" onClick={() => onJoinLounge(movie)}>
              <div className="lounge-poster-wrap">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="lounge-poster"
                />
                <div className="lounge-overlay">
                  <div className="lounge-live-badge">LIVE</div>
                  <div className="lounge-overlay-content">
                    <h3>{movie.title}</h3>
                    <button className="lounge-enter-btn">Enter Lounge</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}