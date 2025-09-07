import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, Star, BookOpen } from "lucide-react";
import { getCourses } from "../api/api";

const ExploreCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses({ limit: 4, page: 1 });
        setCourses(response.results);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover a wide range of courses designed to help you master new
            skills and advance your career with hands-on projects and expert
            guidance.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-14 h-14 border-4 border-t-transparent border-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer border border-gray-100"
                >
                  <div className="relative h-48 overflow-hidden">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                        <BookOpen className="h-16 w-16 text-indigo-700" />
                      </div>
                    )}
                    {course.category_name && (
                      <div className="absolute top-4 left-4 flex items-center space-x-2">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-xs font-medium text-gray-900">
                            {course.category_name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-2 text-sm">
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
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => navigate("/courses")}
              >
                View All Courses
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ExploreCourses;
