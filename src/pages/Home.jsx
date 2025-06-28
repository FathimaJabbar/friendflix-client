import React from 'react';

const Home = ({ navigate }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to Friendflix 👥🍿</h1>
      <button onClick={() => navigate('register')}>Register</button>
      <button onClick={() => navigate('select')}>Select Movies</button>
      <button onClick={() => navigate('matches')}>Find Matches</button>
    </div>
  );
};

export default Home;
