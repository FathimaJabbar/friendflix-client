import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MovieSelector.css";

const TMDB_API_KEY = "96d6e812cf355a07e7026acbd3cd93cb";

export default function MovieSelector({ onSelectionComplete, initialSelected = [], onBack }) {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async (searchTerm) => {
    try {
      const url = searchTerm
        ? `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1`;
      const res = await axios.get(url);
      setMovies((res.data.results || []).filter((m) => m.poster_path));
    } catch {
      alert("Could not reach TMDB. Please check your network connection.");
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    fetchMovies(val);
  };

  const toggleSelect = (movie) => {
    setSelected((prev) =>
      prev.find((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  return (
    <div className="selector-wrapper page-wrapper">
      <div className="selector-top">
        <div className="selector-header-row">
          {onBack && (
            <button className="nav-back-btn" onClick={onBack} title="Go Back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Back</span>
            </button>
          )}
          <div>
            <h2>Curate Your Taste</h2>
            <p>Select at least 3 films to calibrate your matching algorithm</p>
          </div>
        </div>
        
        <div className="selector-search-wrap">
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="selector-search"
            placeholder="Search titles, directors, genres..."
            value={query}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="movie-grid">
        {movies.map((movie) => {
          const isSelected = !!selected.find((m) => m.id === movie.id);
          return (
            <div
              key={movie.id}
              className={`movie-card ${isSelected ? "selected" : ""}`}
              onClick={() => toggleSelect(movie)}
            >
              <img
                className="movie-poster"
                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                alt={movie.title}
              />
              {isSelected && (
                <div className="selected-overlay">
                  <div className="selected-check-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="movie-title-bar">{movie.title}</div>
            </div>
          );
        })}
      </div>

      <div className="selector-bottom-bar">
        <span className="selection-count">
          <strong>{selected.length}</strong> selected {selected.length >= 3 ? "(Ready)" : `(Need ${3 - selected.length} more)`}
        </span>
        <button
          className="btn-primary"
          onClick={() => {
            if (selected.length >= 3) onSelectionComplete(selected);
            else alert("Please select at least 3 films to continue.");
          }}
          disabled={selected.length < 3}
          style={{ opacity: selected.length < 3 ? 0.45 : 1, padding: "10px 24px", borderRadius: "999px" }}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
}