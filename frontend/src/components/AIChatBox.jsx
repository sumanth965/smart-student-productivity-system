import React, { useState } from 'react';
import { Brain, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AI Chat Box Component
 * Standalone chat interface for AI task assistant
 * Provides real-time responses based on task analysis
 */
const AIChatBox = ({ tasks }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! Ask me anything about your tasks or workload.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Generate contextual AI responses based on task data
     */
    const generateAIResponse = (query) => {
        const highRiskTasks = tasks.filter(t => t.riskScore >= 70);
        const urgentTasks = tasks.filter(t => {
            const days = (new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
            return days < 2;
        });

        const lowerQuery = query.toLowerCase();

        // What should I do first / start / priority
        if (lowerQuery.includes('what should') || lowerQuery.includes('first') || lowerQuery.includes('start')) {
            if (highRiskTasks.length > 0) {
                return `Start with "${highRiskTasks[0].title}" - it has the highest risk score (${highRiskTasks[0].riskScore}%). This is both important and urgent.`;
            }
            return 'Focus on tasks with upcoming deadlines first.';
        }

        // General help / how questions
        if (lowerQuery.includes('help') || lowerQuery.includes('how') || lowerQuery.includes('can')) {
            return `You have ${tasks.length} tasks. I recommend focusing on ${highRiskTasks.length} high-risk items. Would you like specific tips?`;
        }

        // Urgent / deadline questions
        if (lowerQuery.includes('urgent') || lowerQuery.includes('deadline') || lowerQuery.includes('soon')) {
            return `${urgentTasks.length} tasks are due within 2 days: ${urgentTasks.map(t => t.title).join(', ')}. I recommend prioritizing these.`;
        }

        // Complex tasks / breakdown questions
        if (lowerQuery.includes('break down') || lowerQuery.includes('subtask') || lowerQuery.includes('complex')) {
            const complexTask = tasks.find(t => t.complexity >= 0.85);
            if (complexTask) {
                return `"${complexTask.title}" is complex. Break it into: (1) Research/Planning, (2) Draft/Development, (3) Review/Polish.`;
            }
            return 'Complex tasks work best when broken into 3-4 subtasks.';
        }

        // Balance / schedule / planning questions
        if (lowerQuery.includes('balance') || lowerQuery.includes('schedule') || lowerQuery.includes('plan')) {
            return `Spend 40% on high-risk tasks, 35% on medium-risk, 25% on low-risk. Your current distribution needs adjustment.`;
        }

        // Default response
        return `I analyzed your ${tasks.length} tasks. ${highRiskTasks.length} are high-risk. Would you like recommendations for specific tasks?`;
    };

    /**
     * Handle sending a message to the AI
     */
    const handleSend = () => {
        if (!input.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput('');
        setIsLoading(true);

        setTimeout(() => {
            const response = generateAIResponse(input);
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
            setIsLoading(false);

            console.log(`[API] POST /api/ai/chat`, { message: input, response });
        }, 600);
    };

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
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-lg text-sm ${msg.role === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400 animate-bounce" />
                                    <div className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

export default AIChatBox;
