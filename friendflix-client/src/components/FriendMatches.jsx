import React, { useEffect, useState } from 'react';

const FriendMatches = ({ userId }) => {
  const [matchedFriends, setMatchedFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(`/api/match/${userId}`);
        const data = await res.json();
        setMatchedFriends(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
        setLoading(false);
      }
    };

    if (userId) {
      fetchMatches();
    }
  }, [userId]);

  if (loading) return <div>Loading matches...</div>;

  return (
    <div>
      <h2>Matched Friends</h2>
      {matchedFriends.length === 0 ? (
        <p>No matched friends found.</p>
      ) : (
        <ul>
          {matchedFriends.map((friend) => (
            <li key={friend._id}>
              <strong>{friend.username}</strong><br />
              🎬 Movies in common: {friend.movies.join(', ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendMatches;
