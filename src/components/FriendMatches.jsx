import React from "react";
import "./FriendMatches.css";

const FriendMatches = ({ matches, onBack, onStartChat }) => {
  if (!matches || !Array.isArray(matches)) {
    return (
      <div className="matches-container glass-panel">
        <p>Loading matches...</p>
        <button className="btn-secondary" onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div className="matches-container glass-panel">
      <h2>Your Movie Matches 🍿</h2>
      {matches.length === 0 ? (
        <p className="no-matches">No matches found yet. Try selecting more popular movies!</p>
      ) : (
        <div className="matches-list">
          {matches.map((match) => (
            <div key={match.userId} className="match-card">
              <div className="match-info">
                <h3>{match.displayName}</h3>
                <p>Shared {match.commonMovies.length} movie(s)</p>
              </div>
              <button 
                className="btn-primary chat-btn" 
                onClick={() => onStartChat({ uid: match.userId, displayName: match.displayName })}
              >
                💬 Chat
              </button>
            </div>
          ))}
        </div>
      )}
      <button className="btn-secondary back-btn" onClick={onBack}>Back to Menu</button>
    </div>
  );
};

export default FriendMatches;
