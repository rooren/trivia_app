import React, { useState, useEffect } from 'react';
import axios from 'axios';
import he from 'he';
import './App.css';

const API_URL = 'https://opentdb.com/api.php?amount=10';

function App() {
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  const [result, setResult] = useState({
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  });
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);

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
  }, []);

  if (questions.length === 0 || activeQuestion < 0) {
    return <div>Loading...</div>;
  }

  const resetQuiz = () => {
    setQuestions([]);
    setActiveQuestion(0);
    setSelectedAnswer('');
    setShowResult(false);
    setResult({
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
    });
    setSelectedAnswerIndex(null);
    fetchQuestions();
  };


  if (activeQuestion >= questions.length) {
    return (
      <div>
        <h1>Quiz Finished</h1>
        <p>Score: {result.score}</p>
        <p>Correct Answers: {result.correctAnswers}</p>
        <p>Wrong Answers: {result.wrongAnswers}</p>
        <div className="flex-right">
          <button onClick={resetQuiz}>Play Again</button>
        </div>
      </div>
    );
  }

  const choices = questions[activeQuestion].answers;
  const question = questions[activeQuestion].question;

  const onClickNext = () => {
    setActiveQuestion((prev) => prev + 1);

    if (selectedAnswer !== '') {
      setResult((prev) => ({
        score: prev.score + 5,
        correctAnswers: prev.correctAnswers + 1,
        wrongAnswers: prev.wrongAnswers,
      }));
    } else {
      setResult((prev) => ({
        score: prev.score,
        correctAnswers: prev.correctAnswers,
        wrongAnswers: prev.wrongAnswers + 1,
      }));
    }
    if (activeQuestion === questions.length - 1) {
      setShowResult(true);
    }
    // Reset selectedAnswer for the next question
    setSelectedAnswer('');
  };

  const onAnswerSelected = (answer, index) => {
    setSelectedAnswer(answer);
    setSelectedAnswerIndex(index);
  };


  const addLeadingZero = (number) => (number > 9 ? number : `0${number}`);

  return (
    <div className="quiz-container">
      {(
        <div>
          <div>
            <span className="active-question-no">{addLeadingZero(activeQuestion + 1)}</span>
            <span className="total-question">/{addLeadingZero(questions.length)}</span>
          </div>
          <h2>{question}</h2>
          <ul>
            {choices.map((answer, index) => (
              <li
                onClick={() => onAnswerSelected(answer, index)}
                key={answer}
                className={selectedAnswerIndex === index ? 'selected-answer' : null}
              >
                {answer}
              </li>
            ))}
          </ul>
          <div className="flex-right">
            <button onClick={onClickNext} disabled={selectedAnswerIndex === null}>
              {activeQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
