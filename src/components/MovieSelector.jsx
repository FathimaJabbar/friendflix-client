import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MovieSelector.css";

const TMDB_API_KEY = "96d6e812cf355a07e7026acbd3cd93cb";

export default function MovieSelector({ onSelectionComplete }) {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async (searchTerm) => {
    try {
      const endpoint = searchTerm
        ? `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${searchTerm}`
        : `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1`;

      const res = await axios.get(endpoint);
      setMovies(res.data.results);
    } catch (error) {
      console.error("TMDB API Error:", error);
      alert("Network Error: Could not reach the movie database. If you are in India, your ISP (like Jio) might be blocking TMDB. Try using a VPN or changing your DNS!");
    }
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
    fetchMovies(e.target.value);
  };

  const toggleSelect = (movie) => {
    if (selected.find((m) => m.id === movie.id)) {
      setSelected(selected.filter((m) => m.id !== movie.id));
    } else {
      setSelected([...selected, movie]);
    }
  };

  const handleSubmit = () => {
    if (selected.length >= 3) {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = {
        ...user,
        selectedMovies: selected.map((movie) => movie.title),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onSelectionComplete(selected);
    } else {
      alert("Please select at least 3 movies to continue.");
    }
  };

  return (
    <div className="movie-selector-container">
      <h2>Select at least 3 movies you've watched</h2>
      <input
        type="text"
        className="search-input"
        placeholder="Search for a movie..."
        value={query}
        onChange={handleSearch}
      />
      <div className="movie-grid">
        {movies.map((movie) => {
          const isSelected = selected.find((m) => m.id === movie.id);
          return (
            <div
              key={movie.id}
              onClick={() => toggleSelect(movie)}
              className={`movie-card ${isSelected ? "selected" : ""}`}
            >
              <img
                className="movie-poster"
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={movie.title}
              />
              <h4>{movie.title}</h4>
            </div>
          );
        })}
      </div>
      <button className="btn-primary submit-btn" onClick={handleSubmit}>
        Continue ➞
      </button>
    </div>
  );
}
