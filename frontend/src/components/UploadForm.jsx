// frontend/src/components/UploadForm.jsx

import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

// UPDATED: New, more detailed category options
const categoryOptions = [
    { value: "T-Shirt", label: "T-Shirt" },
    { value: "Shirt", label: "Shirt" },
    { value: "Blouse", label: "Blouse" },
    { value: "Sweater", label: "Sweater" },
    { value: "Jeans", label: "Jeans" },
    { value: "Trousers", label: "Trousers" },
    { value: "Skirt", label: "Skirt" },
    { value: "Dress", label: "Dress" },
    { value: "Jacket", label: "Jacket" },
    { value: "Coat", label: "Coat" },
    { value: "Heels", label: "Heels" },
    { value: "Flats", label: "Flats" },
    { value: "Sneakers", label: "Sneakers" },
];

const colorOptions = [
  { value: "Black", label: "Black" }, { value: "White", label: "White" },
  { value: "Red", label: "Red" }, { value: "Blue", label: "Blue" },
  { value: "Green", label: "Green" }, { value: "Pink", label: "Pink" },
  { value: "Grey", label: "Grey" }, { value: "Beige", label: "Beige" },
  { value: "Navy", label: "Navy" },
];

// Dropdown styling logic
const getSelectStyles = (isDark) => ({
    control: (base) => ({ ...base, backgroundColor: isDark ? "#1f2937" : "#ffffff", borderColor: isDark ? "#4b5563" : "#d1d5db" }),
    singleValue: (base) => ({ ...base, color: isDark ? "#ffffff" : "#000000" }),
    menu: (base) => ({ ...base, backgroundColor: isDark ? "#1f2937" : "#ffffff" }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? (isDark ? "#374151" : "#e0e7ff") : "transparent", color: isDark ? "#ffffff" : "#000000" }),
    input: (base) => ({ ...base, color: isDark ? "#ffffff" : "#000000" }),
});

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(null);
  const [color, setColor] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkDark = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // FIX: Only the file is now required.
    if (!file) {
      alert("Please select an image to upload.");
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);
    
    // FIX: Only append category and color if they have been selected by the user.
    if (category) {
      formData.append("category", category.value);
    }
    if (color) {
      formData.append("color", color.value);
    }

    try {
      await axios.post(`http://127.0.0.1:5000/upload`, formData);
      alert("Uploaded successfully!");
      // Reset form
      setFile(null);
      setCategory(null);
      setColor(null);
      // This is a simple way to reset the file input visually
      e.target.reset(); 
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
        setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File input */}
      <div>
        <label className="block font-semibold mb-2">Upload Image (Required)</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 dark:file:bg-violet-900/50 file:text-violet-700 dark:file:text-violet-300 hover:file:bg-violet-100 dark:hover:file:bg-violet-900/80`}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block font-semibold mb-2">Category (Optional)</label>
        <p className="text-xs text-gray-500 mb-2">Leave blank to let the AI decide.</p>
        <CreatableSelect
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          isClearable
          placeholder="Select or type category..."
          styles={getSelectStyles(isDarkMode)}
        />
      </div>

      {/* Color */}
      <div>
        <label className="block font-semibold mb-2">Color (Optional)</label>
        <CreatableSelect
          options={colorOptions}
          value={color}
          onChange={setColor}
          isClearable
          placeholder="Select or type color..."
          styles={getSelectStyles(isDarkMode)}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading}
        className="w-full py-3 text-white font-bold rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
