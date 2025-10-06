import React, { useEffect, useState } from "react";
import { getCourses, getCategories } from "../api/api";
import { Search, Star, Users, BookOpen, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const CoursesPage = () => {
  const [searchParams] = useSearchParams();
  const categoryIdFromParams = searchParams.get("id");
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    categoryIdFromParams ? [parseInt(categoryIdFromParams)] : []
  );
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [orderBy, setOrderBy] = useState(""); // allow multiple filters
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Debounce state for price
  const [debouncedMin, setDebouncedMin] = useState(minPrice);
  const [debouncedMax, setDebouncedMax] = useState(maxPrice);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMin(minPrice);
      setDebouncedMax(maxPrice);
    }, 500);
    return () => clearTimeout(handler);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 6 };
        if (search) params.search = search;
        if (selectedCategories.length > 0) params.category = selectedCategories;
        if (debouncedMin) params.min_price = debouncedMin;
        if (debouncedMax) params.max_price = debouncedMax;
        if (orderBy) params.order_by = orderBy;

        const data = await getCourses(params);  
        console.log("Fetched courses:", data.results);
        setCourses(data.results);
        setPages(data.pages);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load courses", err);
        setLoading(false);
      }
    };
    fetchCourses();
  }, [search, selectedCategories, debouncedMin, debouncedMax, orderBy, page]);

  const toggleCategory = (id) => {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleOrder = (criteria) => {
    setPage(1);
    setOrderBy((prev) => (prev === criteria ? "" : criteria));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 mt-16">
      {/* 🔍 Filters Top Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for courses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 px-3 py-2 border rounded-lg"
            />
            <span>-</span>
            <input
              type="number"
              min="0"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Category Bubbles */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                selectedCategories.includes(cat.id)
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sorting Bubbles */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => toggleOrder("enrollments")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              orderBy.includes("enrollments")
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Most Enrolled
          </button>
          <button
            onClick={() => toggleOrder("price_asc", true)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              orderBy.includes("price_asc")
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Lowest Price
          </button>
          <button
            onClick={() => toggleOrder("price_desc", true)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              orderBy.includes("price_desc")
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Highest Price
          </button>
          <button
            onClick={() => toggleOrder("recent")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              orderBy.includes("recent")
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Newest
          </button>
        </div>
      </div>

      {/* 📚 Course Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">No courses found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transition transform hover:-translate-y-2 hover:shadow-xl cursor-pointer"
            >
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-indigo-50">
                  <BookOpen className="h-12 w-12 text-indigo-700" />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {course.description}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  By{" "}
                  {course.instructor_profile?.first_name +
                    "" +
                    course.instructor_profile?.last_name ||
                    "Unknown Instructor"}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.enrollments_count} enrolled
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {course.average_rating?.toFixed(1) || "0.0"} (
                    {course.ratings_count})
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-600 text-lg">
                    ${Number(course.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {course.level || "All Levels"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center mt-8 space-x-2 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-4 py-2 rounded-lg ${
              page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Previous
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page === pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className={`px-4 py-2 rounded-lg ${
              page === pages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
