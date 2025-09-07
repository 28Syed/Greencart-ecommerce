import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/razorpayController.js';
import authUser from '../middlewares/authUser.js';

const razorpayRouter = express.Router();

razorpayRouter.post('/order', authUser, createRazorpayOrder);
razorpayRouter.post('/verify', authUser, verifyRazorpayPayment);

export default razorpayRouter;
