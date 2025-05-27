import FeedbackModel from '../models/FeedbackModel.js';

class FeedbackController {
  constructor() {
  }


  static async getFeedbacks(req, res) {
    try {
      const { role } = req;
      if (role !== 'admin') {
        return res.status(401).json({ message: "You don't have permission to perform this action." });
      }

      // Get pagination parameters from query
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const rating = req.query.rating ? parseInt(req.query.rating) : null;
      const filter = req.query.filter || 'all';
      const sortBy = req.query.sortBy || 'date';

      const result = await FeedbackModel.getFeedbacks({ page, limit, search, rating, filter, sortBy });

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      return res.status(500).json({ message: "internal error" });
    }
  }

  
  static async getFeedback(req, res) {
    try {
      const { role } = req;
      if (role !== 'admin') {
        return res.status(401).json({ message: "You don't have permission to perform this action." });
      }
      const { id } = req.query;
      console.log(id);
      
      const result = await FeedbackModel.getFeedback(id);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching feedback:', error)
      return res.status(500).json({ message: "internal error" });
    }
  }

  static async createFeedback(req, res) {

    try {
      const { name, rating, message } = req.body;

      // Validation
      if (!name || !rating || !message) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' })
      }

      if (name.length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters' })
      }

      if (message.length < 10) {
        return res.status(400).json({ error: 'Message must be at least 10 characters' })
      }

      const newFeedbackObj = req.body;

      const newFeedback = await FeedbackModel.createFeedback(newFeedbackObj);

      return res.status(201).json(newFeedback);
    } catch (error) {
      console.error('Error creating feedback:', error)
      return res.status(500).json({ message: "internal error" });
    }
  }


  static async getFeedbacksStat(req, res) {

    try {

      console.log("getFeedbacksStat");
      
      const statistics = await FeedbackModel.getFeedbacksStat();

      return res.status(200).json(statistics);
    } catch (error) {
      console.error('Error fetching stats:', error)
      return res.status(500).json({ message: "internal error" });
    }
  }

  static async deleteFeedback(req, res) {

    try {
      const { role } = req;
      if (role !== 'admin') {
        return res.status(401).json({ message: "You don't have permission to perform this action." });
      }

      const { id } = req.params

      const feedbackDeleted = await FeedbackModel.deleteFeedback(id);
      if (!feedbackDeleted) {
        return res.status(404).json({ message: "Feedback not found" });
      }

      return res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      console.error('Error deleting feedback:', error)
      return res.status(500).json({ message: "internal error" });
    }
  }



}

export default FeedbackController;
