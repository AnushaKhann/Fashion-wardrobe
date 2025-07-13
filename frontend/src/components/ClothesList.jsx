import { useEffect, useState } from "react";
import axios from "axios";

export default function ClothesList() {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null); // For 3-dot toggle menu

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/clothes`)
      .then((res) => {
        setClothes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch clothes:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/clothes/${id}`);
      setClothes((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item.");
    }
  };

  if (loading) return <p>Loading your wardrobe...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {clothes.map((item) => (
        <div
          key={item.id}
          className="relative rounded-xl shadow-md bg-white dark:bg-gray-800 p-4 transition-transform hover:scale-105"
        >
          {/* Image */}
          <img
            src={`${process.env.REACT_APP_API_URL}/uploads/${item.filename}`}
            className="rounded-md mb-2 h-48 object-cover w-full"
            alt={item.category}
          />

          {/* Category & Color */}
          <p className="font-semibold text-gray-800 dark:text-white capitalize">
            {item.category}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300 capitalize">
            {item.color}
          </p>

          {/* 3-dot toggle menu in bottom right */}
          <div className="absolute bottom-2 right-2 z-20">
            <button
              onClick={() =>
                setMenuOpenId((prev) => (prev === item.id ? null : item.id))
              }
              className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white text-xl"
            >
              ⋯
            </button>

            {menuOpenId === item.id && (
              <div className="absolute right-0 bottom-10 w-28 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow z-30">
                <button
                  onClick={() => alert("Edit functionality coming soon!")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
