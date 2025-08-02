// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Wardrobe from "./pages/Wardrobe";
import Upload from "./pages/Upload";
import Chat from "./pages/Chat";
import Home from "./pages/Home";

function App() {
  const [page, setPage] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleNewChat = async () => {
    try {
        const res = await axios.post('http://127.0.0.1:5000/chats');
        const newChatId = res.data.id;
        setActiveChatId(newChatId);
        setPage('chat');
    } catch (err) {
        console.error("Failed to create new chat", err);
        alert("Could not start a new chat session.");
    }
  };

  useEffect(() => {
    if (page === 'chat' && !activeChatId) {
        handleNewChat();
    }
  }, [page, activeChatId]);

  return (
    <div className={`flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300`}>
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 transition-transform duration-300 
        ${showSidebar ? "translate-x-0" : "-translate-x-full"} 
        shadow-2xl`}
      >
        <Sidebar
          page={page}
          setPage={setPage}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          onNewChat={handleNewChat}
          closeSidebar={() => setShowSidebar(false)}
          // Add these props back
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </div>

      <main className={`flex-1 h-full relative overflow-y-auto transition-all duration-300 ${showSidebar ? 'pl-72' : 'pl-24'}`}>
        <div
          className="absolute inset-0 z-0 transition-opacity duration-1000"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            opacity: darkMode ? 0.3 : 0.5
          }}
        />
        <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/70 backdrop-blur-md transition-all duration-300" />

        <div className="relative z-20 p-8 h-full">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="fixed top-6 left-6 z-40 p-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full shadow-lg text-gray-800 dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            )}
            
            {page === "home" && <Home setPage={setPage} />}
            {page === "chat" && <Chat activeChatId={activeChatId} />}
            {page === "upload" && <Upload />}
            {page === "wardrobe" && <Wardrobe />}
        </div>
      </main>
    </div>
  );
}

export default App;
