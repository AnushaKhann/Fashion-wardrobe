// frontend/src/components/Sidebar.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import ThemeToggle from "./ThemeToggle"; // We need this again

// --- Icon Components ---
const HomeIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ChatIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const UploadIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const WardrobeIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H20.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M12 12v10"/></svg>;
const CloseIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SettingsIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0 2l-.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const DeleteIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;


// --- Sub-component for each chat item in the history ---
const ChatHistoryItem = ({ chat, isActive, onClick, onRename, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(chat.title);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const handleRename = () => {
        if (title.trim() && title !== chat.title) onRename(chat.id, title.trim());
        else setTitle(chat.title);
        setIsEditing(false);
    };

    return (
        <div className={`w-full text-left p-2 my-0.5 rounded-md text-sm truncate flex justify-between items-center transition-colors group ${
                isActive ? 'bg-violet-200 dark:bg-violet-800 font-semibold' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {isEditing ? (
                <input 
                    ref={inputRef} type="text" value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    className="bg-transparent w-full outline-none ring-1 ring-violet-500 rounded-sm px-1"
                />
            ) : (
                <button onClick={onClick} className="flex-grow text-left truncate pr-2">{chat.title}</button>
            )}

            {/* FIX: Replaced menu with direct buttons that appear on hover */}
            <div className="flex items-center gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white"><EditIcon /></button>
                <button onClick={() => onDelete(chat.id)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"><DeleteIcon /></button>
            </div>
        </div>
    );
};

// --- Main Sidebar Component ---
export default function Sidebar({ page, setPage, activeChatId, setActiveChatId, onNewChat, closeSidebar, darkMode, setDarkMode }) {
    const [chats, setChats] = useState([]);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const fetchChats = () => {
        axios.get('http://127.0.0.1:5000/chats')
            .then(res => setChats(res.data))
            .catch(err => console.error("Failed to fetch chats", err));
    };

    useEffect(() => { fetchChats(); }, [activeChatId]);

    const handleRename = async (id, newTitle) => {
        try {
            await axios.put(`http://127.0.0.1:5000/chats/${id}`, { title: newTitle });
            fetchChats();
        } catch (err) { console.error("Failed to rename chat", err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this chat?")) {
            try {
                await axios.delete(`http://127.0.0.1:5000/chats/${id}`);
                if (activeChatId === id) onNewChat();
                else fetchChats();
            } catch (err) { console.error("Failed to delete chat", err); }
        }
    };

  return (
    <div className="h-full p-4 flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl flex items-center">
            <span className="font-light text-gray-800 dark:text-white">Fashion</span>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 ml-1.5">AI</span>
        </h1>
        <button onClick={closeSidebar} className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><CloseIcon /></button>
      </div>

      <nav>
        <NavItem icon={<HomeIcon />} label="Home" onClick={() => setPage('home')} isActive={page === 'home'} />
        <NavItem icon={<ChatIcon />} label="Stylist Chat" onClick={() => setPage('chat')} isActive={page === 'chat'} />
        <NavItem icon={<WardrobeIcon />} label="My Wardrobe" onClick={() => setPage('wardrobe')} isActive={page === 'wardrobe'}/>
        <NavItem icon={<UploadIcon />} label="Upload Clothes" onClick={() => setPage('upload')} isActive={page === 'upload'} />
      </nav>

      <div className="flex-grow flex flex-col min-h-0 mt-4 border-t border-gray-200 dark:border-gray-700 pt-2">
        <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Recent Chats</h2>
            <button onClick={onNewChat} className="text-xs font-semibold text-violet-600 hover:underline">+ New</button>
        </div>
        <div className="flex-grow overflow-y-auto -mr-4 pr-4">
            {chats.map(chat => (
                <ChatHistoryItem key={chat.id} chat={chat} isActive={activeChatId === chat.id && page === 'chat'}
                    onClick={() => { setActiveChatId(chat.id); setPage('chat'); }}
                    onRename={handleRename} onDelete={handleDelete}
                />
            ))}
        </div>
      </div>
      
      <div className="relative mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <AnimatePresence>
            {settingsOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-full left-0 w-full mb-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg"
                >
                    <h3 className="font-semibold mb-2">Theme</h3>
                    <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
                </motion.div>
            )}
        </AnimatePresence>
        <NavItem icon={<SettingsIcon />} label="Settings" onClick={() => setSettingsOpen(!settingsOpen)} isActive={settingsOpen} />
      </div>
    </div>
  );
}

const NavItem = ({ icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${
        isActive 
        ? 'bg-violet-100 dark:bg-violet-800/50 text-violet-700 dark:text-violet-200' 
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </button>
);
