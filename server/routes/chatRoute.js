import express from 'express';
import { 
    getOrCreateChatSession, 
    sendMessage, 
    getChatHistory, 
    endChatSession 
} from '../controllers/chatController.js';
import authUser from '../middlewares/authUser.js';

const chatRouter = express.Router();

// Get or create chat session
chatRouter.post('/session', authUser, getOrCreateChatSession);

// Send message to AI
chatRouter.post('/message', authUser, sendMessage);

// Get chat history
chatRouter.get('/history/:sessionId', authUser, getChatHistory);

// End chat session
chatRouter.post('/end', authUser, endChatSession);

export default chatRouter;
