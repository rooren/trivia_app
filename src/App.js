import React, { useState, useEffect } from 'react';
import axios from 'axios';
import he from 'he';
import './App.css';
import TitleScreen from './TitleScreen';
import EndScreen from './EndScreen';

const API_URL = 'https://opentdb.com/api.php?amount=10';

function App() {

  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [result, setResult] = useState({
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  })
  const onClickNext = () => {
    setActiveQuestion((prev) => prev + 1)
    setResult((prev) =>
      selectedAnswer
        ? {
            ...prev,
            score: prev.score + 5,
            correctAnswers: prev.correctAnswers + 1,
          }
        : { ...prev, wrongAnswers: prev.wrongAnswers + 1 }
    )
    }

  // Now you can safely access questions[activeQuestion].question here or in other parts of your component
  const fetchQuestions = async () => {
    try {
      const response = await axios.get(API_URL);
      const decodedQuestions = response.data.results.map((result) => ({
        ...result,
        question: he.decode(result.question),
        correct_answer: he.decode(result.correct_answer),
        incorrect_answers: result.incorrect_answers.map(he.decode),
        answers: [...result.incorrect_answers.map(he.decode), he.decode(result.correct_answer)],
      }));
      setQuestions(decodedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []); // empty dependency array ensures the effect runs only once, similar to componentDidMount

  // Ensure questions is not empty and activeQuestion is within a valid index range
  if (questions.length === 0 || activeQuestion < 0 ) {
    return <div>Loading...</div>;
  }
 if(activeQuestion >= questions.length)
  {
    return <div>Finished Quiz</div>; 
  }

  return (
    <div>
      <h1>Quiz</h1>
      <h2>{questions[activeQuestion].question}</h2>
      <ul>
        {questions[activeQuestion].answers.map((item) => (
          <li>{item}</li>
        ))}
        <button onClick={onClickNext}>Next</button>
      </ul>
    </div>
  )
  
}

export default App;
