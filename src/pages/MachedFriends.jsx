// src/pages/MatchedFriends.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MatchedFriends = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://friendflix-backend.up.railway.app/api/match', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMatches(res.data.matches);
    } catch (err) {
      console.error('Error fetching matched friends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Matched Friends</h2>
      {loading ? (
        <p>Loading matches...</p>
      ) : matches.length === 0 ? (
        <p>No matched friends found.</p>
      ) : (
        <ul>
          {matches.map((friend, index) => (
            <li key={index}>
              <strong>{friend.username}</strong> – Shared Movies: {friend.sharedMovies.join(', ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MatchedFriends;
