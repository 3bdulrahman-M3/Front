// src/pages/MyCourses.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudentEnrollments,
  getInstructorCourses,
  deleteCourse,
  withdrawFromCourse,
} from "../api/api";
import {
  Loader2,
  ArrowRight,
  BookOpen,
  ArrowRightCircle,
  Layers,
  User,
  BadgeCheck,
} from "lucide-react";

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await getStudentEnrollments(user.id);
        setEnrollments(data);
        if (role === "instructor") {
          const created = await getInstructorCourses(user.id);
          setCreatedCourses(created);
        }
        console.log("Enrollments data: ", data);
      } catch (error) {
        console.error("Failed to load enrollments", error);
        console.log("Enrollments data error: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center text-gray-600 mt-20">
        Please <span className="text-blue-600">log in</span> to view your
        courses.
      </p>
    );
  }

  // when no enrollments, still render page and show CTA

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 mt-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">📚 My Courses</h1>
      </div>

      {/* Created Courses for Instructors */}
      {role === "instructor" && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Created Courses
            </h2>
            <button
              onClick={() => navigate("/courses/create")}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <BookOpen className="h-4 w-4" /> Create Course
            </button>
          </div>
          {createdCourses.length === 0 ? (
            <p className="text-gray-600">
              You haven't created any courses yet.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {createdCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group hover:shadow-xl transition"
                >
                  <div className="relative">
                    <img
                      src={
                        course.image || "https://via.placeholder.com/400x200"
                      }
                      alt={course.title}
                      className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-white/90 text-gray-800 shadow">
                      <BookOpen className="h-3.5 w-3.5" /> Instructor
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="inline-flex items-center gap-1.5">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>By you</span>
                      </div>
                      {course.category_name && (
                        <div className="inline-flex items-center gap-1.5">
                          <Layers className="h-4 w-4 text-gray-500" />
                          <span>{course.category_name}</span>
                        </div>
                      )}
                    </div>
                    {course.price !== undefined && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-green-600">
                          ${Number(course.price).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition"
                    >
                      Manage course <ArrowRightCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enrolled Courses */}

      {enrollments.length === 0 ? (
        <div className="text-center text-gray-600">
          <p className="mb-6">You are not enrolled in any courses yet.</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:border-blue-400 hover:text-blue-600 transition"
          >
            Explore Courses
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-gray-900 self-start">
              Your Enrolled courses
            </h2>
            <button
              onClick={() => navigate("/courses")}
              className="px-6 py-3 rounded-lg border border-gray-300 hover:border-blue-400 hover:text-blue-600 transition"
            >
              Explore Courses
            </button>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => {
              const course = enrollment;
              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
                >
                  <img
                    src={course.image || "https://via.placeholder.com/400x200"}
                    alt={course.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {course.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-blue-600 font-medium mb-3">
                      <span>{course.category_name || "Uncategorized"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    {course.price !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          ${Number(course.price).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
