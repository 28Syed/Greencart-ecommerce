import express from 'express';
import { addReview, getReviews } from '../controllers/reviewController.js';
import authUser from '../middlewares/authUser.js';

const reviewRouter = express.Router();

reviewRouter.post('/add/:productId', authUser, addReview);
reviewRouter.get('/:productId', getReviews);

export default reviewRouter;
