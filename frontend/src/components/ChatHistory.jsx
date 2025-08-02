// frontend/src/components/ChatHistory.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ChatHistory({ activeChatId, setActiveChatId, onNewChat }) {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/chats')
            .then(res => setChats(res.data))
            .catch(err => console.error("Failed to fetch chats", err));
    }, [activeChatId]); // Refetch when active chat changes to update list

    return (
        <div className="h-full p-4 flex flex-col bg-gray-100 dark:bg-gray-900">
            <button 
                onClick={onNewChat}
                className="w-full mb-4 p-2 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700"
            >
                + New Chat
            </button>
            <div className="flex-grow overflow-y-auto">
                {chats.map(chat => (
                    <button
                        key={chat.id}
                        onClick={() => setActiveChatId(chat.id)}
                        className={`w-full text-left p-2 my-1 rounded-md text-sm truncate ${
                            activeChatId === chat.id 
                            ? 'bg-violet-200 dark:bg-violet-800 font-semibold' 
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {chat.title}
                    </button>
                ))}
            </div>
        </div>
    );
}
