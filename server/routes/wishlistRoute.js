import express from 'express';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/wishlistController.js';
import authUser from '../middlewares/authUser.js';

const wishlistRouter = express.Router();

wishlistRouter.post('/add/:productId', authUser, addToWishlist);
wishlistRouter.delete('/remove/:productId', authUser, removeFromWishlist);
wishlistRouter.get('/', authUser, getWishlist);

export default wishlistRouter;
