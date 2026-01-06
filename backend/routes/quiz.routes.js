const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// ✅ QUIZ CRUD - Instructor
router.post('/', verifyToken, quizController.createQuiz);                    // Create quiz
router.get('/instructor/all', verifyToken, quizController.getInstructorQuizzes);  // Get instructor's quizzes
router.get('/:id', quizController.getQuiz);                                 // Get quiz with all questions
router.put('/:id', verifyToken, quizController.updateQuiz);                 // Update quiz
router.delete('/:id', verifyToken, quizController.deleteQuiz);              // Delete quiz
router.put('/:id/publish', verifyToken, quizController.publishQuiz);        // Publish quiz

// ✅ QUESTIONS
router.post('/:id/questions', verifyToken, quizController.addQuestion);     // Add question to quiz
router.put('/questions/:id', verifyToken, quizController.updateQuestion);   // Update question
router.delete('/questions/:id', verifyToken, quizController.deleteQuestion); // Delete question

// ✅ CHOICES (for MCQ/Checkbox)
router.post('/questions/:id/choices', verifyToken, quizController.addChoice);  // Add choice
router.delete('/choices/:id', verifyToken, quizController.deleteChoice);    // Delete choice

// ✅ SHORT ANSWER
router.post('/questions/:id/answer', verifyToken, quizController.setShortAnswer); // Set correct answer for short answer

// ✅ QUIZ ATTEMPTS - Student
router.post('/attempts/start', verifyToken, quizController.startQuizAttempt);    // Start attempt
router.post('/attempts/submit', verifyToken, quizController.submitQuizAttempt);  // Submit attempt
router.get('/:id/attempts/active', verifyToken, quizController.getActiveAttempt); // Get student's latest attempt for quiz/activity
router.get('/attempts/:id/details', verifyToken, quizController.getAttemptDetails); // Get attempt details
router.get('/:id/score', verifyToken, quizController.getStudentScore);      // Get student's best score

// ✅ QUIZ ATTEMPTS - Instructor
router.get('/:id/attempts', verifyToken, quizController.getQuizAttempts);   // Get all attempts for a quiz

module.exports = router;
