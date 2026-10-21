import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import "./MovieSwiper.css";

const TMDB_API_KEY = "96d6e812cf355a07e7026acbd3cd93cb";

const FALLBACK_MOVIES = [
  { id: 693134, title: "Dune: Part Two", release_date: "2024", vote_average: 8.3, poster_path: "/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg" },
  { id: 157336, title: "Interstellar", release_date: "2014", vote_average: 8.4, poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
  { id: 872585, title: "Oppenheimer", release_date: "2023", vote_average: 8.1, poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
  { id: 569094, title: "Spider-Man: Across the Spider-Verse", release_date: "2023", vote_average: 8.4, poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg" },
  { id: 414906, title: "The Batman", release_date: "2022", vote_average: 7.7, poster_path: "/74xTEgt7R36Fpooo50r9T25onhq.jpg" },
  { id: 27205, title: "Inception", release_date: "2010", vote_average: 8.4, poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg" },
  { id: 155, title: "The Dark Knight", release_date: "2008", vote_average: 8.5, poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { id: 939243, title: "Sonic the Hedgehog 3", release_date: "2024", vote_average: 7.8, poster_path: "/d8qZZIMioGQQUvP75cCyQ582r6v.jpg" },
];

export default function MovieSwiper({ onAddMovie, onBack }) {
  const [movies, setMovies] = useState(FALLBACK_MOVIES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);

  const fetchLiveMovies = async (pageNum) => {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=${pageNum}`
      );
      const valid = (res.data.results || []).filter((m) => m.poster_path);
      if (valid.length > 0) {
        setMovies(valid);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.warn("Using fallback deck due to network latency:", err);
    }
  };

  useEffect(() => {
    fetchLiveMovies(1);
  }, []);

  const handleNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLiveMovies(nextPage);
  };

  const handleSwipe = (direction) => {
    if (direction === "right" && movies[currentIndex]) {
      onAddMovie(movies[currentIndex]);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const currentMovie = movies[currentIndex];
  const isDeckComplete = currentIndex >= movies.length;

  return (
    <div className="swiper-page-wrapper">
      {/* Ambient background glow matching the active poster */}
      {currentMovie?.poster_path && (
        <div
          className="swiper-ambient-backdrop"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w780${currentMovie.poster_path})`,
          }}
        />
      )}

      <div className="swiper-container page-wrapper">
        <div className="swiper-header">
          <button className="icon-back-btn" onClick={onBack} title="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="header-titles">
            <h2>Discovery Deck</h2>
            <span className="swiper-hint">Swipe right to add to library, left to pass</span>
          </div>
          <div style={{ width: "38px" }}></div>
        </div>

        {isDeckComplete ? (
          <div className="swiper-empty-box">
            <div className="deck-finished-card">
              <h3>Deck Complete</h3>
              <p>You have reviewed all current suggestions.</p>
              <div className="deck-actions">
                <button className="btn-primary" onClick={handleNextPage}>
                  Load Fresh Movies
                </button>
                <button className="btn-secondary" onClick={onBack}>
                  Return Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="card-stack">
              <AnimatePresence>
                {movies.slice(currentIndex, currentIndex + 1).map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onSwipe={handleSwipe} />
                ))}
              </AnimatePresence>
            </div>

            <div className="swiper-controls">
              <button className="skip-btn" onClick={() => handleSwipe("left")}>
                Pass
              </button>
              <button className="like-btn" onClick={() => handleSwipe("right")}>
                Add to Library
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MovieCard({ movie, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 80) onSwipe("right");
    else if (info.offset.x < -80) onSwipe("left");
  };

  const score = movie.vote_average ? Math.round(movie.vote_average * 10) : null;

  return (
    <motion.div
      className="swipe-card"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.01 }}
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 450 : -450, opacity: 0, transition: { duration: 0.22 } }}
    >
      <div className="card-media-wrap">
        <img
          src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
          alt={movie.title}
          className="card-poster"
        />
        {score && <div className="card-rating-badge">{score}% Match</div>}
      </div>

      <div className="card-info">
        <h3>{movie.title}</h3>
        <p>{movie.release_date ? movie.release_date.split("-")[0] : "Popular Film"}</p>
      </div>
    </motion.div>
  );
}