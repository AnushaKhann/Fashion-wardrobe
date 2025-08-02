// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import PageHeader from '../components/PageHeader';
import axios from 'axios';

// --- Reusable Card Component for the Dashboard ---
const DashboardCard = ({ children, className = "" }) => (
    <div className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg p-6 ${className}`}>
        {children}
    </div>
);

// --- Today's Suggestion Component ---
const TodaysSuggestion = () => {
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Automatically generate a casual outfit for New Delhi on load
        axios.post('http://127.0.0.1:5000/generate-outfit', { prompt: 'a casual outfit for today in New Delhi' })
            .then(response => setSuggestion(response.data))
            .catch(() => setError("Couldn't get a suggestion. Try uploading more clothes!"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-4">Thinking of an outfit for you...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
    if (!suggestion) return null;

    return (
        <div>
            <h3 className="font-bold text-xl mb-4">Today's Quick Suggestion</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Based on the weather: {suggestion.weather_info}</p>
            <div className="flex justify-center gap-4">
                {suggestion.top && <ClothingThumbnail item={suggestion.top} />}
                {suggestion.bottom && <ClothingThumbnail item={suggestion.bottom} />}
                {suggestion.outerwear && <ClothingThumbnail item={suggestion.outerwear} />}
            </div>
        </div>
    );
};

const ClothingThumbnail = ({ item }) => (
    <div className="text-center">
        <img 
            src={`http://127.0.0.1:5000/uploads/${item.filename}`}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg shadow-md mx-auto"
            alt={item.category}
        />
        <p className="text-xs mt-2 capitalize">{item.category}</p>
    </div>
);

// --- Recently Added Component ---
const RecentlyAdded = () => {
    const [recentItems, setRecentItems] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/clothes')
            .then(response => {
                // Get the last 5 items
                setRecentItems(response.data.slice(0, 5));
            })
            .catch(err => console.error(err));
    }, []);

    if (recentItems.length === 0) return null;

    return (
        <div>
            <h3 className="font-bold text-xl mb-4">Recently Added</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
                {recentItems.map(item => (
                    <img
                        key={item.id}
                        src={`http://127.0.0.1:5000/uploads/${item.filename}`}
                        className="w-28 h-28 object-cover rounded-lg shadow-md flex-shrink-0"
                        alt={item.category}
                    />
                ))}
            </div>
        </div>
    );
};


export default function Home() {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <PageHeader 
        title={greeting}
        highlight="Anusha!" // You can make this dynamic later with user accounts
        subtitle="Here's your fashion dashboard for today."
      />

      <DashboardCard>
        <TodaysSuggestion />
      </DashboardCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DashboardCard>
            <h3 className="font-bold text-xl mb-2">Custom Outfit</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get a specific recommendation for any occasion.</p>
            {/* This button should navigate to the Get Outfit page. We'll add the setPage prop later. */}
            <button className="w-full py-2 text-white font-bold rounded-lg bg-gradient-to-r from-pink-500 to-violet-500">
                AI Stylist
            </button>
        </DashboardCard>
        <DashboardCard>
            <h3 className="font-bold text-xl mb-2">Add to Wardrobe</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Upload a new clothing item to your digital closet.</p>
             {/* This button should navigate to the Upload page. We'll add the setPage prop later. */}
            <button className="w-full py-2 text-white font-bold rounded-lg bg-gray-700 dark:bg-gray-600">
                Upload Clothes
            </button>
        </DashboardCard>
      </div>

      <DashboardCard>
        <RecentlyAdded />
      </DashboardCard>

    </motion.div>
  );
}
