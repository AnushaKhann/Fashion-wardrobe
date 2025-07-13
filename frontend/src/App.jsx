import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Wardrobe from "./pages/Wardrobe";

function App() {
  const [page, setPage] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 
        ${showSidebar ? "translate-x-0" : "-translate-x-full"} 
        bg-white dark:bg-gray-800 shadow-lg`}
      >
        <Sidebar
          setPage={setPage}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          closeSidebar={() => setShowSidebar(false)}
        />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 min-h-screen pl-64 relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/fashion-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-white/70 dark:bg-black/60 backdrop-blur-sm" />

        {/* Page Content */}
        <div className="relative z-20 p-6">
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="fixed top-4 left-4 z-40 p-2 bg-gray-300 dark:bg-gray-700 rounded shadow">
            ☰ Menu
          </button>
        )}

          {page === "home" && <Home />}
          {page === "upload" && <Upload />}
          {page === "wardrobe" && <Wardrobe />}
        </div>
      </div>
    </div>
  );
}

export default App;
