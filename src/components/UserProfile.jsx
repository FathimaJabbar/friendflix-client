import React from 'react';

function UserProfile({ user }) {
  if (!user) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>{user.displayName || "Friend"}</h2>
      <h3>Your Selected Movies:</h3>
      <ul>
        {user.selectedMovies?.map(movie => (
          <li key={movie.id}>{movie.title}</li>
        )) || <li>No movies selected</li>}
      </ul>
    </div>
  );
}

export default UserProfile;
