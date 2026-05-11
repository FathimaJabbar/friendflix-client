import React from "react";
import "./FriendMatches.css";

const FriendMatches = ({ matches, onBack, onStartChat }) => {
  if (!matches || !Array.isArray(matches)) {
    return (
      <div className="matches-container page-wrapper">
        <div className="empty-state"><p>Loading matches...</p></div>
      </div>
    );
  }

  return (
    <div className="matches-container page-wrapper">
      <div className="matches-header">
        <h2>Your Matches <span className="match-count">{matches.length}</span></h2>
        <p>People who love the same movies you do 🍿</p>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No matches yet</h3>
          <p>Select more popular movies to discover people with similar taste!</p>
        </div>
      ) : (
        <div className="matches-list">
          {matches
            .sort((a, b) => b.matchPercentage - a.matchPercentage)
            .map((match, i) => (
              <div key={match.userId} className="match-card glass-card">
                <div className="match-rank">#{i + 1}</div>
                <img
                  src={match.photoURL || `https://ui-avatars.com/api/?name=${match.displayName}&background=random`}
                  alt="Avatar"
                  className="match-avatar"
                />
                <div className="match-info">
                  <div className="match-header-row">
                    <h3>{match.displayName}</h3>
                    {match.badge && (
                      <span className="user-badge">{match.badge.emoji} {match.badge.name}</span>
                    )}
                  </div>
                  <p className="match-bio">"{match.bio}"</p>
                  <div className="compat-row">
                    <div className="compat-bar">
                      <div className="compat-fill" style={{ width: `${match.matchPercentage}%` }} />
                    </div>
                    <span className="compat-label">{match.matchPercentage}% match</span>
                  </div>
                  <p className="shared-movies">
                    🎬 {match.commonMovies.slice(0, 3).map((m) => m.title).join(", ")}
                    {match.commonMovies.length > 3 ? ` +${match.commonMovies.length - 3} more` : ""}
                  </p>
                </div>
                <button
                  className="btn-primary chat-btn"
                  onClick={() => onStartChat({
                    uid: match.userId,
                    displayName: match.displayName,
                    photoURL: match.photoURL,
                  })}
                >
                  💬
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default FriendMatches;
