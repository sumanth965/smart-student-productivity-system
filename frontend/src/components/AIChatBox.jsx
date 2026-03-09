import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Brain, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AI Chat Box Component
 * Standalone chat interface for AI task assistant
 * Provides real-time responses based on task analysis via Gemini AI
 */
const AIChatBox = ({ tasks }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! Ask me anything about your tasks or workload.', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    /**
     * Send message to Gemini AI and get real response
     */
    const handleSend = useCallback(async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: new Date() }]);
        setInput('');
        setIsLoading(true);

        try {
            console.log('🔵 Sending message to backend:', userMessage);

            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    tasks: tasks || [],
                }),
            });

            console.log('📊 Response Status:', response.status, response.statusText);

            const data = await response.json();

            if (!response.ok) {
                // Backend returned detailed error
                const errorMessage = data.details || data.error || `API Error: ${response.status}`;
                const hint = data.hint || '';
                const fullError = `${errorMessage}${hint ? ' - ' + hint : ''}`;
                throw new Error(fullError);
            }

            // Handle successful response
            const aiResponse = data.reply || data.message || 'No response received';

            setMessages(prev => [...prev, {
                role: 'ai',
                text: aiResponse,
                timestamp: new Date(),
            }]);

            console.log('✅ AI Response generated:', aiResponse.substring(0, 100) + '...');

        } catch (error) {
            console.error('❌ Chat Error:', error.message);

            let errorText = error.message;

            // Add helpful hints
            if (error.message.includes('Failed to fetch')) {
                errorText = '❌ Cannot connect to backend. Make sure npm run dev is running on port 5000';
            } else if (error.message.includes('API key')) {
                errorText = '❌ Gemini API key error. Get a new key from https://ai.google.dev/ and add to .env';
            }

            setMessages(prev => [...prev, {
                role: 'ai',
                text: `⚠️ Error: ${errorText}`,
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [input, tasks]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-purple-500/10 p-6 space-y-4"
        >
            {/* Header */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                AI Assistant
            </h3>

            {/* Chat Messages Container */}
            <div className="h-64 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl p-4">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={`msg-${i}-${msg.timestamp.getTime()}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-lg text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-start"
                        >
                            <div className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                                <div className="flex gap-1">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400"
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400"
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                                    />
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400"
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                    title={isLoading ? 'Waiting for response...' : 'Send message'}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

export default AIChatBox;
