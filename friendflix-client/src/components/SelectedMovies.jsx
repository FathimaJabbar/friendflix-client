import React from 'react';
import FriendMatches from './FriendMatches';

const SelectedMovies = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Safely fallback to empty array if user or selectedMovies is null
  const selectedMovies = user?.selectedMovies ?? [];

  return (
    <div>
      <h2>Your Selected Movies</h2>

      {selectedMovies.length === 0 ? (
        <p>You haven't selected any movies yet.</p>
      ) : (
        <ul>
          {selectedMovies.map((movie, idx) => (
            <li key={idx}>{movie}</li>
          ))}
        </ul>
      )}

      {/* Only show FriendMatches if user exists */}
      {user ? (
        <FriendMatches userId={user._id} />
      ) : (
        <p>Please log in to see friend matches.</p>
      )}
    </div>
  );
};

export default SelectedMovies;
