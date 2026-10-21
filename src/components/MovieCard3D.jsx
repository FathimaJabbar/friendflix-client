import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function MovieCard3D({ posterPath, title, subtitle, onClick, className = "", children }) {
  const cardRef = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareOpacity = useTransform(mouseXSpring, [-0.5, 0.5], [0, 0.25]);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`movie-card-3d ${className}`}
    >
      <div className="card-inner" style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
        {posterPath && (
          <img
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title || "Movie poster"}
            className="poster-image"
          />
        )}
        <motion.div
          className="glare-effect"
          style={{
            background: useTransform(
              glareX,
              (latest) => `radial-gradient(circle at ${latest} ${glareY.get()}%, rgba(255,255,255,0.4), transparent 60%)`
            ),
            opacity: glareOpacity,
          }}
        />
        {(title || subtitle || children) && (
          <div className="card-overlay">
            {title && <h4>{title}</h4>}
            {subtitle && <p>{subtitle}</p>}
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}