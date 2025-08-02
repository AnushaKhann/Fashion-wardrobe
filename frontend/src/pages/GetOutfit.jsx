// frontend/src/pages/GetOutfit.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from '../components/PageHeader';
import axios from 'axios';

// A component to display the suggested outfit
const OutfitDisplay = ({ outfit }) => {
    if (!outfit) return null;

    const top = outfit.top;
    const bottom = outfit.bottom;
    const outerwear = outfit.outerwear;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
        >
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Your AI-Generated Outfit</h3>
                {outfit.weather_info && <p className="text-gray-500 dark:text-gray-400 mt-1">Based on the weather: {outfit.weather_info}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {top && <ClothingCard item={top} type={top.category === 'Dress' ? 'Dress' : 'Top'}/>}
                {bottom && <ClothingCard item={bottom} type="Bottom"/>}
                {outerwear && <ClothingCard item={outerwear} type="Outerwear"/>}
            </div>

            {/* --- NEW: Stylist Notes Section --- */}
            {outfit.stylist_notes && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">AI Stylist's Notes:</h4>
                    <p className="text-gray-600 dark:text-gray-300 italic">"{outfit.stylist_notes}"</p>
                </div>
            )}
        </motion.div>
    );
};

const ClothingCard = ({ item, type }) => (
    <div className="flex flex-col items-center">
        <h4 className="font-semibold mb-2 text-gray-600 dark:text-gray-300">{type}</h4>
        <img
            src={`http://127.0.0.1:5000/uploads/${item.filename}`}
            className="w-full h-64 object-cover rounded-lg shadow-md"
            alt={item.category}
        />
        <p className="mt-2 font-medium text-gray-800 dark:text-white capitalize">{item.category}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item.color}</p>
    </div>
);


export default function GetOutfit() {
  const [prompt, setPrompt] = useState("A casual outfit for today in New Delhi");
  const [loading, setLoading] = useState(false);
  const [outfit, setOutfit] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
      setLoading(true);
      setError('');
      setOutfit(null);
      try {
          const response = await axios.post('http://127.0.0.1:5000/generate-outfit', { prompt });
          setOutfit(response.data);
      } catch (err) {
          setError(err.response?.data?.error || 'Could not generate an outfit. Make sure you have enough clothes!');
          console.error(err);
      }
      setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader 
        title="AI" 
        highlight="Stylist"
        subtitle="Describe the outfit you need, and let the AI handle the rest."
      />

      <div className="p-6 max-w-2xl mx-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg">
        <div className="mb-4">
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">Your Request</label>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., I need a formal outfit for a work event in London. Something in black or navy."
                className="w-full p-3 h-24 bg-white dark:bg-gray-700 rounded-lg border-2 border-transparent focus:border-violet-500 focus:outline-none transition-all resize-none"
            />
        </div>
        <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full py-3 text-white font-bold rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
            {loading ? 'Thinking...' : '✨ Generate Outfit'}
        </button>
      </div>

      {error && <p className="text-center mt-4 text-red-500">{error}</p>}
      
      <OutfitDisplay outfit={outfit} />
    </motion.div>
  );
}
