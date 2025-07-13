import { motion } from "framer-motion";

export default function Sidebar({ setPage, darkMode, setDarkMode, closeSidebar }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
    <div className="h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👗 Fashion AI</h1>
        <button onClick={closeSidebar} className="text-xl">✖</button>
      </div>

      <button className="block mb-3" onClick={() => setPage("home")}>🏠 Home</button>
      <button className="block mb-3" onClick={() => setPage("upload")}>⬆️ Upload Clothes</button>
      <button className="block mb-3" onClick={() => setPage("wardrobe")}>👚 My Wardrobe</button>

      <div className="mt-10">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 rounded border dark:border-white border-gray-900"
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </div>
    </motion.div>
  );
}
