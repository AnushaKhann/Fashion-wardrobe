// frontend/src/components/ClothesList.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import EditModal from "./EditModal"; // Import the new modal component

// This is the card for an individual clothing item
const ClothingItemCard = ({ item, onDelete, onEdit }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item?')) {
        onDelete(item.id);
    }
    setMenuOpen(false);
  }

  const handleEditClick = (e) => {
      e.stopPropagation();
      onEdit(item); // Pass the full item object to the edit handler
      setMenuOpen(false);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative rounded-xl shadow-lg bg-white dark:bg-gray-800 p-3 transition-transform hover:scale-105 group"
    >
      <img
        src={`http://127.0.0.1:5000/uploads/${item.filename}`}
        className="rounded-md mb-2 h-56 object-cover w-full"
        alt={item.category}
      />
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800 dark:text-white capitalize">
            {item.category}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300 capitalize">
            {item.color}
          </p>
        </div>
        <div className="relative">
            <button onClick={(e) => {e.stopPropagation(); setMenuOpen(!menuOpen)}} className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white text-xl z-10">⋯</button>
            <AnimatePresence>
            {menuOpen && (
                <motion.div 
                    initial={{opacity: 0, y: 10}} 
                    animate={{opacity: 1, y: 0}} 
                    exit={{opacity: 0, y: 10}} 
                    className="absolute right-0 bottom-8 w-28 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-xl z-20"
                >
                    <button onClick={handleEditClick} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-md">Edit</button>
                    <button onClick={handleDeleteClick} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-b-md">Delete</button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};


export default function ClothesList() {
  const [clothes, setClothes] = useState([]);
  const [groupedClothes, setGroupedClothes] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const API_URL = "http://127.0.0.1:5000";

  // This function now returns the new groups so we can check them
  const fetchAndGroupClothes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/clothes`);
      const fetchedClothes = res.data;
      setClothes(fetchedClothes);
      const grouped = fetchedClothes.reduce((acc, item) => {
        const category = item.category || "Uncategorized";
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {});
      setGroupedClothes(grouped);
      return grouped; // Return the new groups
    } catch (err) {
      console.error("❌ Failed to fetch clothes:", err);
      return {}; // Return empty object on error
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndGroupClothes();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/clothes/${id}`);
      const newGroups = await fetchAndGroupClothes();
      // If the currently viewed category no longer exists, go back to folder view
      if (selectedCategory && !newGroups[selectedCategory]) {
        setSelectedCategory(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item.");
    }
  };

  const handleSaveEdit = async (id, updatedData) => {
    try {
        await axios.put(`${API_URL}/clothes/${id}`, updatedData);
        setEditingItem(null); // Close the modal
        const newGroups = await fetchAndGroupClothes();
        // If the currently viewed category no longer exists, go back to folder view
        if (selectedCategory && !newGroups[selectedCategory]) {
            setSelectedCategory(null);
        }
    } catch (err) {
        console.error("Update failed:", err);
        alert("Failed to update item.");
    }
  }

  if (loading) return <p className="text-center mt-8">Loading your wardrobe...</p>;
  
  // FIX: This is now safe. If the category doesn't exist, it will result in an empty array.
  const itemsInSelectedCategory = groupedClothes[selectedCategory] || [];

  return (
    <div>
      <EditModal 
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      <AnimatePresence mode="wait">
        {selectedCategory ? (
          // DETAIL VIEW
          <motion.div key="items" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <button onClick={() => setSelectedCategory(null)} className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              ← Back to Categories
            </button>
            <h3 className="text-3xl font-bold mb-4 capitalize">{selectedCategory}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {itemsInSelectedCategory.map((item) => (
                <ClothingItemCard key={item.id} item={item} onDelete={handleDelete} onEdit={setEditingItem} />
              ))}
            </div>
          </motion.div>
        ) : (
          // FOLDER VIEW
          <motion.div key="folders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Object.keys(groupedClothes).map((category) => (
              <motion.div key={category} onClick={() => setSelectedCategory(category)} className="cursor-pointer aspect-square rounded-2xl p-4 flex flex-col justify-end shadow-lg bg-white dark:bg-gray-800 relative overflow-hidden group" whileHover={{ scale: 1.03 }}>
                <img src={`${API_URL}/uploads/${groupedClothes[category][0].filename}`} className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={category}/>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="relative z-10 text-white">
                  <h4 className="text-2xl font-bold capitalize">{category}</h4>
                  <p>{groupedClothes[category].length} items</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
