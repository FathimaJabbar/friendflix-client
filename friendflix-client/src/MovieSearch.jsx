import React, { useState } from 'react';
import axios from 'axios';

const API_KEY = '96d6e812cf355a07e7026acbd3cd93cb'; 

function MovieSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);

  const searchMovies = async () => {
    if (!query.trim()) return;

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
    );
    setResults(response.data.results);
  };

  const toggleSelect = (movie) => {
    if (selected.find((m) => m.id === movie.id)) {
      setSelected(selected.filter((m) => m.id !== movie.id));
    } else {
      setSelected([...selected, movie]);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Search Movies You've Watched</h2>
      <input
        className="border p-2 w-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a movie"
      />
      <button onClick={searchMovies} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        Search
      </button>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {results.map((movie) => (
          <div
            key={movie.id}
            onClick={() => toggleSelect(movie)}
            className={`cursor-pointer p-2 border rounded ${
              selected.find((m) => m.id === movie.id) ? 'bg-green-200' : ''
            }`}
          >
            <strong>{movie.title}</strong> ({movie.release_date?.split('-')[0]})
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-bold">Selected Movies:</h3>
        <ul>
          {selected.map((movie) => (
            <li key={movie.id}>{movie.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MovieSearch;
