// src/pages/CourseDetail.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourse, getCourseRcommendation, enrollInCourse } from "../api/api";
import {
  Star,
  Users,
  Clock,
  Globe,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Settings,
  Loader2,
} from "lucide-react";
import Review from "../components/Reviews";
import { toast } from "react-hot-toast";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState([]);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourse(id);
        setCourse(data);
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecs = async () => {
      try {
        const data = await getCourseRcommendation(id);
        setRecs(data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };

    fetchCourse();
    fetchRecs();
  }, [id]);

  const handleEnroll = async (courseId) => {
    try {
      const res = await enrollInCourse(courseId);
      navigate(`/course/${courseId}`);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/login");
      } else {
        console.error("Enrollment failed:", err);
        toast.error(
          err.response?.data?.message ||
            "Enrollment failed. Please try again later."
        );
      }
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center text-gray-600 py-20">Course not found.</div>
    );
  }

  return (
    <div className="mt-12">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-6 relative grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-blue-100 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                {course.average_rating?.toFixed(1) || "0"} (
                {course.ratings_count} ratings)
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {course.enrollments_count} students
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {course.duration} hrs
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {course.language}
              </div>
            </div>

            {course.id &&
            user.role === "instructor" &&
            course.instructor === user.id ? (
              <button
                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                onClick={() => {
                  navigate("/courses/create?edit=" + course.id);
                }}
              >
                Edit Course
              </button>
            ) : (
              <button
                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                onClick={() => {
                  const token = localStorage.getItem("accessToken");
                  if (!token) {
                    navigate("/login");
                    return;
                  }
                  course.is_enrolled
                    ? navigate(`/courses/${course.id}`)
                    : navigate(`/courses/${course.id}/payment`);
                }}
              >
                {course.is_enrolled
                  ? "Go to Course"
                  : `Enroll Now - $${course.price}`}
              </button>
            )}
          </div>

          <div>
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="rounded-2xl shadow-lg w-full max-h-[400px] object-cover"
              />
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-left">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Course Description
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {showFullDesc
              ? course.description
              : `${course.description.slice(0, 400)}...`}
          </p>
          {course.description.length > 400 && (
            <button
              onClick={() => setShowFullDesc((prev) => !prev)}
              className="mt-3 text-blue-600 font-medium hover:underline"
            >
              {showFullDesc ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </section>

      {/* What you’ll learn */}
      {course.learning_objectives?.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
              What you’ll learn
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {course.learning_objectives.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Requirements & Audience */}
      {(course.requirements?.length > 0 ||
        course.target_audience?.length > 0) && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-left grid md:grid-cols-2 gap-12">
            {course.requirements?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.target_audience?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Who this course is for
                </h2>
                <ul className="space-y-2">
                  {course.target_audience.map((aud, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      {aud}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <Review courseId={course.id} is_enrolled={course.is_enrolled}></Review>
      {/* Instructor */}
      {course.instructor_profile && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Instructor
            </h2>
            <div className="flex items-center gap-4">
              <img
                src={course.instructor_profile.image || "/default-avatar.png"}
                alt={course.instructor_profile.full_name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-lg text-gray-900">
                  {course.instructor_profile.first_name}{" "}
                  {course.instructor_profile.last_name}
                </p>
                <p className="text-gray-600 text-sm">
                  {course.instructor_profile.bio}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              You might also like
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
              {recs.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => window.location.assign(`/course/${rec.id}`)}
                  className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer overflow-hidden group w-full max-w-sm"
                >
                  {/* Category badge */}
                  {rec.category_name && (
                    <span className="absolute top-3 left-3 bg-white text-blue text-xs font-semibold px-4 py-3 rounded-full shadow-md">
                      {rec.category_name}
                    </span>
                  )}

                  {rec.image && (
                    <img
                      src={rec.image}
                      alt={rec.title}
                      className="w-full h-44 object-cover"
                    />
                  )}

                  <div className="p-2 flex flex-col items-center text-center">
                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {rec.title}
                    </h3>

                    {/* Instructor */}
                    <p className="text-sm text-gray-500 mb-3">
                      By{" "}
                      <span className="font-medium text-gray-700">
                        {rec.instructor_profile?.first_name}{" "}
                        {rec.instructor_profile?.last_name}
                      </span>
                    </p>

                    {/* Stats */}
                    <div className="flex justify-center gap-5 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        {Number(rec.average_rating || 0).toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {rec.enrollments_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {rec.duration ? Number(rec.duration).toFixed(1) : "0"}h
                      </div>
                    </div>

                    {/* Price */}
                    <p className="text-xl font-semibold text-600 mb-2">
                      ${rec.price}
                    </p>
                  </div>

                  {/* Bottom arrow bar */}
                  <div className="w-full bg-blue-50 py-3 flex items-center justify-center gap-2 text-blue-600 font-medium group-hover:bg-blue-100 transition">
                    <span>View Course</span>
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CourseDetail;

// Simple FAQ accordion section
const FAQSection = ({ id, items = [] }) => {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <SectionHeader title="FAQ" id={id} />
      <div className="bg-white rounded-2xl shadow-lg divide-y">
        {items.length === 0 ? (
          <div className="p-6 text-gray-600">No FAQs yet.</div>
        ) : (
          items.map((q, i) => (
            <div key={i}>
              <button
                className="w-full text-left p-4 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center justify-between"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="pr-4 truncate">
                  {q.question || `Question ${i + 1}`}
                </span>
                {open === i ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {open === i && (
                <div className="px-4 pb-4 text-gray-700">
                  {q.answer || "No answer provided."}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
