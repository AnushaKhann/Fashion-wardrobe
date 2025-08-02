// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import PageHeader from '../components/PageHeader';

const DashboardCard = ({ children, className = "" }) => (
    <div className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg p-6 ${className}`}>
        {children}
    </div>
);

export default function Home({ setPage }) {
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
        highlight="Anusha!"
        subtitle="Welcome to your personal AI fashion dashboard."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DashboardCard>
            <h3 className="font-bold text-xl mb-2">Start a New Chat</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get a personalized outfit recommendation from the AI stylist.</p>
            <button 
                onClick={() => setPage('chat')}
                className="w-full py-2 text-white font-bold rounded-lg bg-gradient-to-r from-pink-500 to-violet-500"
            >
                Go to AI Stylist
            </button>
        </DashboardCard>
        <DashboardCard>
            <h3 className="font-bold text-xl mb-2">Manage Your Wardrobe</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Upload new clothes or view your entire digital closet.</p>
            <button 
                onClick={() => setPage('wardrobe')}
                className="w-full py-2 text-white font-bold rounded-lg bg-gray-700 dark:bg-gray-600"
            >
                View Wardrobe
            </button>
        </DashboardCard>
      </div>
    </motion.div>
  );
}
