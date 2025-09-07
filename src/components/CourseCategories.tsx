import React, { useEffect, useState } from "react";
import { getCategories } from "../api/api"; // adjust import path
import {
  Code,
  PenTool,
  TrendingUp,
  Music,
  Globe,
  Languages,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Category = {
  id: number;
  name: string;
  image_url: string;
};

const iconMap: Record<string, React.ComponentType<any>> = {
  "Web Development": Code,
  "Design & Creative": PenTool,
  "Business & Finance": TrendingUp,
  Marketing: Globe,
  Language: Languages,
  "Music & Audio": Music,
};

const colorMap: Record<string, string> = {
  "Web Development": "bg-blue-500 group-hover:bg-blue-600",
  "Design & Creative": "bg-purple-500 group-hover:bg-purple-600",
  "Business & Finance": "bg-green-500 group-hover:bg-green-600",
  Marketing: "bg-teal-500 group-hover:bg-teal-600",
  Language: "bg-orange-500 group-hover:bg-orange-600",
  "Music & Audio": "bg-pink-500 group-hover:bg-pink-600",
};

const CourseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.slice(0, 6));
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading categories...
      </div>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Course Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your passion and build expertise in the field that
            interests you most. Our comprehensive categories cover everything
            from technology to creative arts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = iconMap[category.name] || Layers;
            const colorClasses =
              colorMap[category.name] || "bg-gray-500 group-hover:bg-gray-600";

            return (
              <div
                key={category.id}
                onClick={() => {
                  navigate("courses?id=" + category.id);
                }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div
                    className={`absolute top-4 right-4 p-3 rounded-full ${colorClasses} transition-colors`}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            View All Categories
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default CourseCategories;
