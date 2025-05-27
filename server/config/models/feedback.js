import mongoose from 'mongoose';

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
  }
}, {
  timestamps: true
})

const Feedback = mongoose.model('Feedback', feedbackSchema)
Feedback.syncIndexes();

export default Feedback;