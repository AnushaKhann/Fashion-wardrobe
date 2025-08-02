// frontend/src/pages/Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import OutfitModal from '../components/OutfitModal'; // Import the new modal

// --- Reusable Message Component ---
const ChatMessage = ({ message, onViewOutfit }) => {
    const isUser = message.role === 'user';
    const outfitData = message.outfit_data ? JSON.parse(message.outfit_data) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 items-start my-4 ${isUser ? 'justify-end' : ''}`}
        >
            {!isUser && <div className="w-8 h-8 rounded-full bg-violet-500 flex-shrink-0"></div>}
            <div className={`p-4 rounded-2xl max-w-lg ${isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'}`}>
                <p>{message.content}</p>
                {outfitData && (
                    <div className="cursor-pointer" onClick={() => onViewOutfit(outfitData)}>
                        <OutfitDisplay outfit={outfitData} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// --- Outfit Display inside a message ---
const OutfitDisplay = ({ outfit }) => (
    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600 group">
        <p className="text-xs text-center font-semibold text-gray-500 dark:text-gray-400 mb-2 group-hover:text-violet-500">Click to view</p>
        <div className="grid grid-cols-3 gap-2 text-center">
            {outfit.top && <ClothingThumbnail item={outfit.top} />}
            {outfit.bottom && <ClothingThumbnail item={outfit.bottom} />}
            {outfit.outerwear && <ClothingThumbnail item={outfit.outerwear} />}
        </div>
    </div>
);

const ClothingThumbnail = ({ item }) => (
    <div>
        <img src={`http://127.0.0.1:5000/uploads/${item.filename}`} className="w-full h-24 object-cover rounded-md shadow-sm" alt={item.category} />
        <p className="text-xs mt-1 capitalize">{item.category}</p>
    </div>
);

// --- Main Chat Component ---
export default function Chat({ activeChatId }) {
    const [messages, setMessages] = useState([]);
    const [inputPrompt, setInputPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewingOutfit, setViewingOutfit] = useState(null); // State for the modal
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (activeChatId) {
            setLoading(true);
            axios.get(`http://127.0.0.1:5000/chats/${activeChatId}/messages`)
                .then(res => setMessages(res.data))
                .catch(err => console.error("Failed to fetch messages", err))
                .finally(() => setLoading(false));
        }
    }, [activeChatId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputPrompt.trim() || !activeChatId) return;

        const userMessage = { role: 'user', content: inputPrompt, outfit_data: null };
        setMessages(prev => [...prev, userMessage]);
        setInputPrompt('');
        setLoading(true);

        try {
            const res = await axios.post(`http://127.0.0.1:5000/chats/${activeChatId}/messages`, { prompt: userMessage.content });
            setMessages(prev => [...prev, res.data]);
        } catch (err) {
            console.error("Failed to send message", err);
            const errorMsg = { role: 'ai', content: "Sorry, I ran into an error. Please try again.", outfit_data: null };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <OutfitModal outfit={viewingOutfit} onClose={() => setViewingOutfit(null)} />

            <PageHeader title="AI" highlight="Stylist Chat" subtitle="Your personal fashion conversationalist." />
            
            <div className="flex-grow overflow-y-auto pr-4">
                {messages.map((msg, index) => <ChatMessage key={index} message={msg} onViewOutfit={setViewingOutfit} />)}
                {loading && <ChatMessage message={{role: 'ai', content: "Thinking..."}} />}
                <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                    <input
                        type="text"
                        value={inputPrompt}
                        onChange={(e) => setInputPrompt(e.target.value)}
                        placeholder="Ask for an outfit..."
                        className="flex-grow p-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-transparent focus:border-violet-500 focus:outline-none"
                    />
                    <button type="submit" disabled={loading} className="px-6 py-3 text-white font-bold rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
