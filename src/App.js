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
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null)

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

  const choices = questions[activeQuestion].answers
  const question = questions[activeQuestion].question
  const correct_answer = questions[activeQuestion].correct_answer


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

  const onAnswerSelected = (answer, index) => {
    setSelectedAnswerIndex(index)
    if (answer === correct_answer) {
      setSelectedAnswer(true)
    } else {
      setSelectedAnswer(false)
    }
  }

  return (
    <div className="quiz-container">
      <h1>Quiz</h1>
      <h2>{question}</h2>
      <ul>
            {choices.map((answer, index) => (
              <li
                onClick={() => onAnswerSelected(answer, index)}
                key={answer}
                className={selectedAnswerIndex === index ? 'selected-answer' : null}>
                {answer}
              </li>
            ))}
          </ul>
<button onClick={onClickNext} disabled={selectedAnswerIndex === null}>
  {activeQuestion === questions.length - 1 ? 'Finish' : 'Next'}
</button>
  </div>
  )
}


export default App;
