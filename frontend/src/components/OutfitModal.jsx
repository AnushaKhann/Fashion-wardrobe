// frontend/src/components/OutfitModal.jsx
import { motion, AnimatePresence } from "framer-motion";

const ClothingCard = ({ item, type }) => (
    <div className="flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">{type}</h3>
        <img
            src={`http://127.0.0.1:5000/uploads/${item.filename}`}
            className="w-full h-80 object-cover rounded-xl shadow-lg"
            alt={item.category}
        />
        <p className="mt-3 text-lg font-medium text-gray-800 dark:text-white capitalize">{item.category}</p>
        <p className="text-md text-gray-500 dark:text-gray-400 capitalize">{item.color}</p>
    </div>
);

export default function OutfitModal({ outfit, onClose }) {
  if (!outfit) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
              Today's Look
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl">
              &times;
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {outfit.top && <ClothingCard item={outfit.top} type={outfit.top.category === 'Dress' ? 'Dress' : 'Top'}/>}
            {outfit.bottom && <ClothingCard item={outfit.bottom} type="Bottom"/>}
            {outfit.outerwear && <ClothingCard item={outfit.outerwear} type="Outerwear"/>}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
