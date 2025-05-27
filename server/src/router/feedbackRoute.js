import express from 'express'
import FeedbackController from '../controllers/FeedbackController.js';
import authToken from '../middleware/authToken.js';
const router = express.Router();

console.log("router");


// בקשות API
// Get all feedbacks (admin only)
router.get('/feedbacks', authToken, FeedbackController.getFeedbacks);
// Get single feedbacks (admin only)
router.get('/feedback', authToken, FeedbackController.getFeedback);
// Create new feedback
router.post('/', FeedbackController.createFeedback);
// Get feedback statistics
router.get('/stats', FeedbackController.getFeedbacksStat);
// Delete feedback (admin only)
router.delete('/:id', authToken, FeedbackController.deleteFeedback);


export default router;