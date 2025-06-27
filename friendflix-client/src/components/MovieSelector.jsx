// src/components/MovieSelector.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const TMDB_API_KEY = "96d6e812cf355a07e7026acbd3cd93cb";

export default function MovieSelector({ onSelectionComplete }) {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async (searchTerm) => {
    const endpoint = searchTerm
      ? `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${searchTerm}`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=1`;

    const res = await axios.get(endpoint);
    setMovies(res.data.results);
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
      // Get user from localStorage (or empty object if not found)
      const user = JSON.parse(localStorage.getItem("user")) || {};

      // Create updated user with selectedMovies as array of titles
      const updatedUser = {
        ...user,
        selectedMovies: selected.map((movie) => movie.title),
      };

      // Save updated user back to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Call the parent's callback
      onSelectionComplete(selected);
    } else {
      alert("Please select at least 3 movies to continue.");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Select at least 3 movies you've watched</h2>
      <input
        type="text"
        placeholder="Search for a movie..."
        value={query}
        onChange={handleSearch}
        style={{ width: "300px", padding: "0.5rem", marginBottom: "1rem" }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
          maxWidth: "800px",
          margin: "auto",
        }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => toggleSelect(movie)}
            style={{
              border: selected.find((m) => m.id === movie.id)
                ? "3px solid #007bff"
                : "1px solid #ccc",
              padding: "0.5rem",
              cursor: "pointer",
            }}
          >
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                  : "https://via.placeholder.com/200x300?text=No+Image"
              }
              alt={movie.title}
              style={{ width: "100%" }}
            />
            <p>{movie.title}</p>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        Continue
      </button>
    </div>
  );
}
