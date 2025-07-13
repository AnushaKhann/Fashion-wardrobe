import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

// Dropdown options
const categoryOptions = [
  { value: "Formal", label: "Formal" },
  { value: "Casual", label: "Casual" },
  { value: "Party", label: "Party" },
  { value: "Chill", label: "Chill" },
  { value: "Nightwear", label: "Nightwear" },
  { value: "Ethnic", label: "Ethnic" },
];

const colorOptions = [
  { value: "Black", label: "Black" },
  { value: "White", label: "White" },
  { value: "Red", label: "Red" },
  { value: "Blue", label: "Blue" },
  { value: "Green", label: "Green" },
  { value: "Pink", label: "Pink" },
];

// Dropdown styling logic
const getSelectStyles = () => {
  const isDark = document.documentElement.classList.contains("dark");
  return {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      color: isDark ? "#ffffff" : "#000000",
      borderColor: state.isFocused ? "#2563eb" : "#ccc",
      boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#ffffff" : "#000000",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? isDark
          ? "#374151"
          : "#e0e7ff"
        : "transparent",
      color: isDark ? "#ffffff" : "#000000",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
    input: (base) => ({
      ...base,
      color: isDark ? "#ffffff" : "#000000",
    }),
  };
};

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(null);
  const [color, setColor] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect theme change dynamically
  useEffect(() => {
    const checkDark = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !category || !color) {
      alert("Please fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category.value);
    formData.append("color", color.value);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData);
      alert("Uploaded successfully!");
      setFile(null);
      setCategory(null);
      setColor(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File input */}
      <div>
        <label className="block font-semibold mb-1">Upload Image</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className={`block w-full p-2 border rounded transition-colors focus:outline-none
            focus:border-blue-600 focus:ring-1 focus:ring-blue-600
            ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block font-semibold mb-1">Category</label>
        <CreatableSelect
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          isClearable
          placeholder="Select or type category..."
          styles={getSelectStyles()}
        />
      </div>

      {/* Color */}
      <div>
        <label className="block font-semibold mb-1">Color</label>
        <CreatableSelect
          options={colorOptions}
          value={color}
          onChange={setColor}
          isClearable
          placeholder="Select or type color..."
          styles={getSelectStyles()}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Upload
      </button>
    </form>
  );
}
