// frontend/src/components/EditModal.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreatableSelect from "react-select/creatable";

// Reusing the dropdown options and styles from UploadForm
const categoryOptions = [
  { value: "T-Shirt", label: "T-Shirt" },
  { value: "Jeans", label: "Jeans" },
  { value: "Skirt", label: "Skirt" },
  { value: "Dress", label: "Dress" },
  { value: "Suit", label: "Suit" },
  { value: "Sweater", label: "Sweater" },
  { value: "Jacket", label: "Jacket" },
];
const colorOptions = [
  { value: "Black", label: "Black" }, { value: "White", label: "White" },
  { value: "Red", label: "Red" }, { value: "Blue", label: "Blue" },
  { value: "Green", label: "Green" }, { value: "Pink", label: "Pink" },
  { value: "Grey", label: "Grey" }, { value: "Beige", label: "Beige" },
  { value: "Navy", label: "Navy" },
];

const getSelectStyles = (isDark) => ({
    control: (base) => ({ ...base, backgroundColor: isDark ? "#1f2937" : "#ffffff", borderColor: isDark ? "#4b5563" : "#d1d5db" }),
    singleValue: (base) => ({ ...base, color: isDark ? "#ffffff" : "#000000" }),
    menu: (base) => ({ ...base, backgroundColor: isDark ? "#1f2937" : "#ffffff" }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? (isDark ? "#374151" : "#e0e7ff") : "transparent", color: isDark ? "#ffffff" : "#000000" }),
    input: (base) => ({ ...base, color: isDark ? "#ffffff" : "#000000" }),
});


export default function EditModal({ item, onClose, onSave }) {
  const [category, setCategory] = useState(null);
  const [color, setColor] = useState(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (item) {
      setCategory({ value: item.category, label: item.category });
      setColor({ value: item.color, label: item.color });
    }
    setIsDark(document.documentElement.classList.contains('dark'));
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item.id, {
      category: category ? category.value : item.category,
      color: color ? color.value : item.color,
    });
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md"
          onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Edit Item</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Category</label>
              <CreatableSelect
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                styles={getSelectStyles(isDark)}
              />
            </div>
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">Color</label>
              <CreatableSelect
                options={colorOptions}
                value={color}
                onChange={setColor}
                styles={getSelectStyles(isDark)}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700">
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
