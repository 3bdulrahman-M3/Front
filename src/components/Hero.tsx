import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Star, Users, BookOpen, Award } from "lucide-react";
import { getCourses } from "../api/api";

const Hero = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    successRatePct: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed from cache first for instant paint
    try {
      const cached = localStorage.getItem("hero_stats_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (
          typeof parsed?.totalStudents === "number" &&
          typeof parsed?.totalCourses === "number" &&
          typeof parsed?.successRatePct === "number"
        ) {
          setStats({
            totalStudents: parsed.totalStudents,
            totalCourses: parsed.totalCourses,
            successRatePct: parsed.successRatePct,
          });
          setLoading(false);
        }
      }
    } catch (_) {}

    const fetchStats = async () => {
      try {
        const data = await getCourses({ limit: 100, page: 1 });
        const results = Array.isArray(data?.results)
          ? data.results
          : data || [];
        const totalCourses = Number(data?.count) || results.length;
        let totalStudents = 0;
        let ratingSum = 0;
        let ratingCount = 0;
        results.forEach((c: any) => {
          if (typeof c?.enrollments_count === "number") {
            totalStudents += c.enrollments_count;
          }
          if (typeof c?.average_rating === "number") {
            ratingSum += c.average_rating;
            ratingCount += 1;
          }
        });
        const avgRating = ratingCount > 0 ? ratingSum / ratingCount : 0;
        const successRatePct = Math.round((avgRating / 5) * 100);
        const next = { totalStudents, totalCourses, successRatePct };

        // Only update if changed
        let different = true;
        try {
          const prevRaw = localStorage.getItem("hero_stats_cache");
          if (prevRaw) {
            const prev = JSON.parse(prevRaw);
            different =
              prev.totalStudents !== next.totalStudents ||
              prev.totalCourses !== next.totalCourses ||
              prev.successRatePct !== next.successRatePct;
          }
        } catch (_) {}

        if (different) {
          setStats(next);
          try {
            localStorage.setItem(
              "hero_stats_cache",
              JSON.stringify({ ...next, cachedAt: Date.now() })
            );
          } catch (_) {}
        }
      } catch (e) {
        // Ignore errors; keep cached values
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-700">
                <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                {loading
                  ? "Loading..."
                  : `Trusted by ${stats.totalStudents.toLocaleString()} Students`}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Learn Skills That
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Transform{" "}
                </span>
                Your Career
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Master in-demand skills with expert-led courses. Join thousands
                of learners advancing their careers through our comprehensive
                online education platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
                onClick={() => (window.location.href = "/courses")}
              >
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>

              {/* <button className="flex items-center justify-center px-8 py-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">
                    {loading ? "—" : stats.totalStudents.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Active Students</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">
                    {loading ? "—" : stats.totalCourses}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Expert Courses</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">
                    {loading
                      ? "—"
                      : `${Math.min(100, Math.max(0, stats.successRatePct))}%`}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Students learning online"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg animate-pulse">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  Live Classes
                </span>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-900">
                  4.9/5 Rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
