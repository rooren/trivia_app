import React, { useState, useEffect } from 'react';
import axios from 'axios';
import he from 'he'; // Import the 'he' library

const API_URL = 'https://opentdb.com/api.php?amount=10';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(API_URL);
      setQuestions(response.data.results.map((result) => ({
        ...result,
        question: he.decode(result.question), // Decode HTML entities in the question
        correct_answer: he.decode(result.correct_answer), // Decode HTML entities in the correct answer
        incorrect_answers: result.incorrect_answers.map(he.decode), // Decode HTML entities in incorrect answers
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

  if (currentQuestion >= questions.length) {
    return (
      <div>
        <h1>Trivia Game Completed!</h1>
        <p>Your final score: {score}</p>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const { category, question, incorrect_answers, correct_answer } = currentQuestionData;
  const allAnswers = [...incorrect_answers, correct_answer];
  const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

  return (
    <div>
      <h1>Trivia Game</h1>
      <p>Category: {category}</p>
      <p>Question {currentQuestion + 1}/10: {question}</p>
      <ul>
        {shuffledAnswers.map((answer, index) => (
          <li key={index}>
            <button onClick={() => handleAnswer(answer)}>{answer}</button>
          </li>
        ))}
      </ul>
      <p>Score: {score}</p>
    </div>
  );
}

export default App;
