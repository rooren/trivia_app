import React, { useState, useEffect } from 'react';
import axios from 'axios';
import he from 'he';
import './App.css';
import TitleScreen from './TitleScreen';
import EndScreen from './EndScreen';

const API_URL = 'https://opentdb.com/api.php?amount=10';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      fetchQuestions();
    }
  }, [gameStarted]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(API_URL);
      setQuestions(response.data.results.map((result) => ({
        ...result,
        question: he.decode(result.question),
        correct_answer: he.decode(result.correct_answer),
        incorrect_answers: result.incorrect_answers.map(he.decode),
        answers: [...result.incorrect_answers.map(he.decode), he.decode(result.correct_answer)],
      })));
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAnswer = (answer) => {
    const isCorrect = answer === questions[currentQuestion].correct_answer;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    setCurrentQuestion((prevQuestion) => prevQuestion + 1);
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  if (!gameStarted) {
    return <TitleScreen onStart={handleStartGame} />;
  }

  if (currentQuestion >= questions.length) {
    return <EndScreen score={score} />;
  }

  return (
    <div className="container">
      <h1>Trivia Game</h1>
      <p className="category">Category: {questions[currentQuestion].category}</p>
      <p className="question">Question {currentQuestion + 1}/10: {questions[currentQuestion].question}</p>
      <ul>
        {questions[currentQuestion].answers.map((answer, index) => (
          <li key={index}>
            <button onClick={() => handleAnswer(answer)}>{answer}</button>
          </li>
        ))}
      </ul>
      <p className="score">Score: {score}</p>
    </div>
  );
}

export default App;
