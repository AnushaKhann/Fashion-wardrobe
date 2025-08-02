// frontend/src/components/Sidebar.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

// --- Icon Components ---
const HomeIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const UploadIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const WardrobeIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H20.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M12 12v10"/></svg>;
const SettingsIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const CloseIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SparkleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;


const NavItem = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full p-3 my-1 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </button>
);

export default function Sidebar({ setPage, darkMode, setDarkMode, closeSidebar }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="h-full p-4 flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl flex items-center">
            <span className="font-light text-gray-800 dark:text-white">Fashion</span>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 ml-1.5">
                AI
            </span>
        </h1>
        <button onClick={closeSidebar} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
          <CloseIcon />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow">
        <NavItem icon={<HomeIcon />} label="Home" onClick={() => setPage("home")} />
        <NavItem icon={<SparkleIcon />} label="Get Outfit" onClick={() => setPage("get-outfit")} />
        <NavItem icon={<UploadIcon />} label="Upload Clothes" onClick={() => setPage("upload")} />
        <NavItem icon={<WardrobeIcon />} label="My Wardrobe" onClick={() => setPage("wardrobe")} />
      </nav>

      {/* Footer / Settings */}
      <div className="relative">
        <AnimatePresence>
            {settingsOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-full left-0 w-full mb-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg"
                >
                    <h3 className="font-semibold mb-2">Theme</h3>
                    <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
                </motion.div>
            )}
        </AnimatePresence>
        <NavItem icon={<SettingsIcon />} label="Settings" onClick={() => setSettingsOpen(!settingsOpen)} />
      </div>
    </div>
  );
}
