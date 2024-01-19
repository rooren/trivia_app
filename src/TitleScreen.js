import React from 'react';

const TitleScreen = ({ onStart }) => (
  <div className="container">
    <h1>Welcome to the Trivia Game!</h1>
    <button onClick={onStart}>Start Game</button>
  </div>
);

export default TitleScreen;
