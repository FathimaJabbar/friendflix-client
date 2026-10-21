import React from "react";
import "./FriendMatches.css";

export default function FriendMatches({ matches, onBack, onStartChat }) {
  if (!matches || !Array.isArray(matches)) {
    return (
      <div className="matches-wrapper page-wrapper">
        <div className="empty-state"><p>Calculating compatibility...</p></div>
      </div>
    );
  }

  return (
    <div className="matches-wrapper page-wrapper">
      <div className="matches-header">
        <button className="btn-secondary back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div>
          <h2>Taste Matches</h2>
          <p>{matches.length} profiles align with your cinematic library</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          <h3>No matches detected yet</h3>
          <p>Add more popular movies to your library to connect with viewers who share your taste.</p>
        </div>
      ) : (
        <div className="matches-list">
          {matches
            .sort((a, b) => b.matchPercentage - a.matchPercentage)
            .map((match, i) => (
              <div key={match.userId} className="match-card glass-card">
                <div className="match-rank">0{i + 1}</div>
                <img
                  src={match.photoURL || `https://ui-avatars.com/api/?name=${match.displayName}&background=random`}
                  alt={match.displayName}
                  className="match-avatar"
                />
                <div className="match-body">
                  <div className="match-title-row">
                    <h4>{match.displayName}</h4>
                    {match.badge && (
                      <span className="clean-badge">{match.badge.name}</span>
                    )}
                  </div>
                  {match.bio && <p className="match-bio">"{match.bio}"</p>}
                  
                  <div className="compat-bar-wrap">
                    <div className="compat-bar">
                      <div className="compat-fill" style={{ width: `${match.matchPercentage}%` }} />
                    </div>
                    <span className="compat-percentage">{match.matchPercentage}%</span>
                  </div>

                  <p className="shared-films-text">
                    Shared: {match.commonMovies.slice(0, 3).map((m) => m.title).join(", ")}
                    {match.commonMovies.length > 3 ? ` +${match.commonMovies.length - 3} more` : ""}
                  </p>
                </div>
                
                <button
                  className="btn-primary message-action-btn"
                  onClick={() => onStartChat({
                    uid: match.userId,
                    displayName: match.displayName,
                    photoURL: match.photoURL,
                  })}
                >
                  Message
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}