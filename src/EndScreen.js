import React from 'react';

const EndScreen = ({ score }) => (
  <div className="container">
    <h1>Trivia Game Completed!</h1>
    <p>Your final score: {score}</p>
  </div>
);

export default EndScreen;
