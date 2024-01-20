import React, { useState, useEffect } from 'react';
import axios from 'axios';
import he from 'he';
import './App.css';

const API_URL = 'https://opentdb.com/api.php?amount=10';

function App() {
  // State variables to manage questions, active question, selected answer, title screen, result, etc.
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [titleScreen, setTitleScreen] = useState(true);
  const [result, setResult] = useState({
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  });
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null);
  
  // Function to fetch trivia questions from the API
  const fetchQuestions = async (retryCount = 20) => {
    let success = false;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        // Shuffles the answers so they will be in random order
        const shuffleArray = (array) => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        };
  
        // Fetch questions from the API and decode HTML entities
        const response = await axios.get(API_URL);
        const decodedQuestions = response.data.results.map((result) => ({
          ...result,
          question: he.decode(result.question),
          correct_answer: he.decode(result.correct_answer),
          category: he.decode(result.category),
          incorrect_answers: result.incorrect_answers.map(he.decode),
          answers: shuffleArray([...result.incorrect_answers.map(he.decode), he.decode(result.correct_answer)]),
        }));
  
        setQuestions(decodedQuestions);
  
        success = true;
        break; // Break out of the loop if fetching is successful
      } catch (error) {
        console.error(`Error fetching questions (attempt ${attempt + 1}/${retryCount + 1}):`, error);
      }
      // Retry after a delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  
    if (!success) {
      console.error('Exhausted retry attempts. Unable to fetch questions.');
    }
  };
  
  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleStartButtonClick = () => {
    setTitleScreen(false); // Set titleScreen to false to hide the title screen
  };

  // Display Loading message if questions are not fetched yet
  if (questions.length === 0) {
    return <div className="quiz-container">Loading...</div>;
  }

  // Display title screen at the start of the game
  if (titleScreen) {
    return (
      <div className="title-screen">
        <h1>Welcome to the trivia Game!</h1>
        <p>Press the start button to begin.</p>
        <button onClick={handleStartButtonClick}>Start</button>
      </div>
    );
  }

  // Reset the quiz state and fetch new questions
  const resetQuiz = () => {
    setQuestions([]);
    setActiveQuestion(0);
    setSelectedAnswer('');
    setResult({
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
    });
    setSelectedAnswerIndex(null);
    setAnswerStatus(null);
    setTitleScreen(true);
    fetchQuestions();
  };

  // Move to the next question
  // To be called while displaying previous questions result
  const nextQuestion = () => {
    setActiveQuestion((prev) => prev + 1);
    setAnswerStatus(null);
  };

  // Display final results if all questions are answered.
  if (activeQuestion >= questions.length) {
    return (
      <div className="quiz-container">
        <h1>Trivia Finished</h1>
        <p>Score: {result.score}</p>
        <p>Correct Answers: {result.correctAnswers}</p>
        <p>Wrong Answers: {result.wrongAnswers}</p>
        <div className="flex-right">
          <button onClick={resetQuiz}>Play Again</button>
        </div>
      </div>
    );
  }

  // Get all question properties for the current displayed question
  const choices = questions[activeQuestion].answers;
  const question = questions[activeQuestion].question;
  const category = questions[activeQuestion].category;

  // Handle the click on the "Select answer" button
  // Updates the score and answer count
  // Update the answer status so it will display the answer status screen
  const onClickSelectAnswer = () => {
    const isCorrect = selectedAnswer === questions[activeQuestion].correct_answer;
    console.log("The correct answer is", questions[activeQuestion].correct_answer)
    console.log("Picked answer is", selectedAnswer)

    setAnswerStatus(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
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

    // Reset selectedAnswer & setSelectedAnswerIndex for the next question
    setSelectedAnswer('');
    setSelectedAnswerIndex(null);
  };

  // Update the selected answer
  const onAnswerSelected = (answer, index) => {
    console.log('Selected Answer:', answer);
    console.log('Selected Answer Index:', index);

    setSelectedAnswer(answer);
    setSelectedAnswerIndex(index);
  };

  // Add a leading zero to a number (for question numbering)
  const addLeadingZero = (number) => (number > 9 ? number : `0${number}`);

  // Display UI for correct or wrong answer feedback
  if(answerStatus !== null )
  {
    return (
      <div className="quiz-container">
        <span className="active-question-no">{addLeadingZero(activeQuestion + 1)}</span>
        <span className="total-question">/{addLeadingZero(questions.length)}</span>
        <h1>{answerStatus === 'correct' ? 'Correct' : 'Wrong'}</h1>
        {answerStatus === 'wrong' && (
          <div className="correct-answer">
            <p>The correct answer is: {questions[activeQuestion].correct_answer}</p>
          </div>
        )}
        <p>Current score: {result.score}</p>
        <div className="flex-right">
          <button onClick={nextQuestion}>
            {activeQuestion === questions.length - 1 ? 'Finish' : 'Next question'}
          </button>
        </div>
      </div>
    );
  }

  // Render the quiz container with the active question and choices
  return (
    <div className="quiz-container">
      <div>
        <div>
          <span className="active-question-no">{addLeadingZero(activeQuestion + 1)}</span>
          <span className="total-question">/{addLeadingZero(questions.length)}</span>
        </div>
        <h2>{question}</h2>
        <p>Category: {category}</p>
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
          {/* Conditionally render the button only if an answer had been selected */}
          {selectedAnswer && (
            <button onClick={onClickSelectAnswer}>Select answer</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;