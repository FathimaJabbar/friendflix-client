import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MovieSelector.css";

const TMDB_API_KEY = "96d6e812cf355a07e7026acbd3cd93cb";

export default function MovieSelector({ onSelectionComplete, initialSelected = [] }) {
  const [movies, setMovies]   = useState([]);
  const [query, setQuery]     = useState("");
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => { fetchMovies(); }, []);

  const fetchMovies = async (searchTerm) => {
    try {
      const url = searchTerm
        ? `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${searchTerm}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1`;
      const res = await axios.get(url);
      setMovies(res.data.results.filter((m) => m.poster_path));
    } catch {
      alert("Network Error: Could not reach TMDB. If you're in India, try a VPN or change DNS to 8.8.8.8.");
    }
  };

  const handleSearch = (e) => { setQuery(e.target.value); fetchMovies(e.target.value); };

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
        <h2>Pick Your Movies 🎬</h2>
        <p>Select at least 3 movies to find matching friends</p>
        <div className="selector-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="selector-search"
            placeholder="Search any movie..."
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
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
              />
              {isSelected && <div className="selected-overlay">✓</div>}
              <div className="movie-title-bar">{movie.title}</div>
            </div>
          );
        })}
      </div>

      {/* Sticky bottom bar */}
      <div className="selector-bottom-bar">
        <span className="selection-count">
          {selected.length} selected {selected.length >= 3 ? "✓" : `(need ${3 - selected.length} more)`}
        </span>
        <button
          className="btn-primary"
          onClick={() => {
            if (selected.length >= 3) onSelectionComplete(selected);
            else alert("Please select at least 3 movies.");
          }}
          disabled={selected.length < 3}
          style={{ borderRadius: "28px", padding: "12px 30px", opacity: selected.length < 3 ? 0.5 : 1 }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
