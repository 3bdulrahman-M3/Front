import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, Star, TrendingUp } from "lucide-react";
import { getUserRecommendation } from "../api/api";

const RecommendedCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await getUserRecommendation();
        setCourses(res);
      } catch (error) {
        console.error("Failed to load recommendations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-sm font-medium text-orange-700 mb-4">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recommended for You
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Courses Tailored to Your Goals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Based on your selected interests and learning history, we’ve found
            courses that can help you level up your skills faster.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-14 h-14 border-4 border-t-transparent border-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courses.map((course) => (
              <div
                onClick={() => navigate(`/course/${course.id}`)}
                key={course.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    {course.category_name && (
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-xs font-medium text-gray-900">
                          {course.category_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    by{" "}
                    {course.instructor_profile
                      ? `${course.instructor_profile.first_name} ${course.instructor_profile.last_name}`
                      : "Unknown"}
                  </p>
                  <p className="text-gray-900 font-semibold mb-4">
                    ${course.price || "Free"}
                  </p>

                  <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                      <span className="font-medium">
                        {course.average_rating || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{course.enrollments_count || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{course.duration || "N/A"}</span>
                    </div>
                  </div>

                  {/* <p className="text-lg font-semibold text-gray-900">
                    ${course.price || "Free"}
                  </p> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedCourses;
