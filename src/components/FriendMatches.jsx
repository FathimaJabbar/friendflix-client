// src/components/FriendMatches.jsx
import React from "react";

const FriendMatches = ({ matches, onBack }) => {
  if (!matches || !Array.isArray(matches)) {
    return (
      <div>
        <p>Loading matches...</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold">You’re matched with Fathima Jabbar 🎬</h3>
      <p>You can now chat with Fathima Jabbar</p>
      <button onClick={onBack}>Back</button>
    </div>
  );
};

export default FriendMatches;
