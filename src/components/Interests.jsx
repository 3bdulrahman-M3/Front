import React, { useEffect, useState } from "react";
import { getCategories, updateProfile } from "../api/api";

export default function InterestsPopup({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);

        if (user?.interests) {
          setSelected(user.interests.map((c) => c.id));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((cat) => cat !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile({ interests: selected });
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          interests: categories.filter((c) => selected.includes(c.id)),
        })
      );
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-10 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold mb-3 text-gray-800">
          Choose Your Interests
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Select your interests and we’ll recommend{" "}
          <span className="font-semibold text-blue-600">
            personalized courses
          </span>{" "}
          for you.
        </p>

        {/* Category bubbles */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform 
                ${
                  selected.includes(cat.id)
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={selected.length === 0 || loading}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform ${
            selected.length === 0 || loading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:-translate-y-1"
          }`}
        >
          {loading ? "Saving..." : "Save My Interests"}
        </button>
      </div>
    </div>
  );
}
