import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import "./MovieSwiper.css";

const TMDB_API_KEY = "96d6e812cf355a07e7026acbd3cd93cb";

export default function MovieSwiper({ onAddMovie, onBack }) {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=2`
        );
        setMovies(res.data.results);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPopular();
  }, []);

  const handleSwipe = (direction) => {
    if (direction === "right" && movies[currentIndex]) {
      onAddMovie(movies[currentIndex]);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  if (currentIndex >= movies.length && movies.length > 0) {
    return (
      <div className="swiper-container glass-panel page-wrapper" style={{ padding: "40px", marginTop: "40px" }}>
        <h2>That's all for now! 🎉</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
          You've swiped through all our current suggestions.
        </p>
        <button className="btn-primary" onClick={onBack}>Back to Menu</button>
      </div>
    );
  }

  return (
    <div className="swiper-container page-wrapper">
      <div className="swiper-header">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <h2 style={{ fontSize: "1.8rem", margin: 0 }}>🔥 Swiper</h2>
        <div style={{ width: "80px" }}></div>
      </div>
      
      <p className="swiper-hint">Swipe Right to Like, Left to Skip</p>

      <div className="card-stack">
        <AnimatePresence>
          {movies.slice(currentIndex, currentIndex + 1).map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onSwipe={handleSwipe} 
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="swiper-controls">
        <button className="btn-secondary skip-btn" onClick={() => handleSwipe("left")}>✖ Skip</button>
        <button className="btn-primary like-btn" onClick={() => handleSwipe("right")}>♥ Like</button>
      </div>
    </div>
  );
}

function MovieCard({ movie, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="swipe-card glass-panel"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.05 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ 
        x: x.get() > 0 ? 500 : x.get() < 0 ? -500 : 0, 
        opacity: 0, 
        transition: { duration: 0.3 } 
      }}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="card-poster"
      />
      <div className="card-info">
        <h3>{movie.title}</h3>
        <p>{movie.release_date?.split("-")[0]}</p>
      </div>
    </motion.div>
  );
}
