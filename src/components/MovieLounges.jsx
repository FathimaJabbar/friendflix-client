import React from "react";
import "./MovieLounges.css";

const MovieLounges = ({ selectedMovies, onJoinLounge, onBack }) => {
  return (
    <div className="lounges-container page-wrapper">
      <div className="lounges-header">
        <h2>🎬 Movie Lounges</h2>
        <p>Jump into public fan clubs based on your favourite films</p>
      </div>

      {selectedMovies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No movies selected yet</h3>
          <p>Select some movies first to access their lounges!</p>
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
                  <div className="lounge-live-badge">● LIVE</div>
                  <div className="lounge-overlay-content">
                    <h3>{movie.title}</h3>
                    <button className="lounge-enter-btn">Enter Lounge →</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieLounges;
