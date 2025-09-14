import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import toast from 'react-hot-toast';

const ChatWidget = () => {
    const { user } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chat session when user logs in
    useEffect(() => {
        if (user && !sessionId) {
            initializeChat();
        }
    }, [user]);

    const initializeChat = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://greencart-production-6542.up.railway.app'}/api/chat/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });

            const data = await response.json();
            if (data.success) {
                setSessionId(data.sessionId);
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
        }
    };

    const getFallbackResponse = (message) => {
        const messageLower = message.toLowerCase();
        if (messageLower.includes('hello') || messageLower.includes('hi')) {
            return "Hello! Welcome to GreenCart. How can I help you today?";
        } else if (messageLower.includes('order')) {
            return "I can help you with your orders. What would you like to know about your orders?";
        } else if (messageLower.includes('product')) {
            return "We have a great selection of fresh products! What specific product are you looking for?";
        } else if (messageLower.includes('help')) {
            return "I'm here to help! I can assist you with orders, products, account issues, or any other questions about GreenCart.";
        } else if (messageLower.includes('thank')) {
            return "You're welcome! Is there anything else I can help you with?";
        } else if (messageLower.includes('price') || messageLower.includes('cost')) {
            return "Our prices are very competitive! You can see the current prices on each product page. We also have special offers and discounts available.";
        } else if (messageLower.includes('delivery') || messageLower.includes('shipping')) {
            return "We offer fast and reliable delivery! You can choose from different delivery options at checkout.";
        } else if (messageLower.includes('payment')) {
            return "We accept various payment methods including credit cards, debit cards, and cash on delivery. All payments are secure and encrypted.";
        } else {
            return "I'm here to help! How can I assist you with your GreenCart shopping today?";
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        // Use local AI responses directly (bypass backend for now)
        setTimeout(() => {
            const fallbackResponse = getFallbackResponse(inputMessage);
            const aiMessage = {
                role: 'assistant',
                content: fallbackResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1000); // Simulate API delay
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col">
                    {/* Header */}
                    <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">GreenCart Support</h3>
                            <p className="text-sm opacity-90">AI Assistant</p>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs px-3 py-2 rounded-lg ${
                                        message.role === 'user'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {new Date(message.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-800 max-w-xs px-3 py-2 rounded-lg">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-4 border-t">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isLoading}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
