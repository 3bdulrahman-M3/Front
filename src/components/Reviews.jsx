import React, { useEffect, useState } from "react";
import {
  getCourseReviews,
  createReview,
  editReview,
  deleteReview,
  getCourse,
} from "../api/api"; // adjust path if needed
import { Star, Loader2, Quote } from "lucide-react";

const CourseReviewsSection = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewsLoaded, setReviewsLoaded] = useState(false); // 👈 NEW
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // pagination + filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState(null);

  // popup
  const [showAll, setShowAll] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchReviews(page);
    checkIfInstructor();
  }, [page]);

  const fetchReviews = async (currentPage = 1) => {
    setLoading(true);
    try {
      const data = await getCourseReviews(courseId, {
        page: currentPage,
        limit: 6, // show 6 per page inside popup
      });
      setReviews(data.results || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
      setReviewsLoaded(true); // 👈 mark as done
    }
  };

  const checkIfInstructor = async () => {
    try {
      const course = await getCourse(courseId);
      setIsInstructor(course.instructor === user?.id);
    } catch (err) {
      console.error("Error checking instructor:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await editReview(editingId, { content, rating });
      } else {
        await createReview(courseId, { content, rating });
      }
      setContent("");
      setRating(5);
      setEditingId(null);
      fetchReviews(page);
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setContent(review.content);
    setRating(review.rating);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteReview(id);
      fetchReviews(page);
    } catch (err) {
      console.error("Error deleting review:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const userReview = reviews.find((r) => r.rater === user?.id);

  // filtered reviews for popup
  const filteredReviews = filter
    ? reviews.filter((r) => r.rating === filter)
    : reviews;

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 mt-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
        Course Reviews
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      ) : (
        <>
          {/* --- Outside reviews as testimonial-style cards --- */}
          <div
            className={`grid gap-8 mb-8 ${
              reviews.length === 1
                ? "grid-cols-1"
                : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {reviews.length > 0 ? (
              reviews.slice(0, 4).map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="mb-6">
                    <Quote className="h-8 w-8 text-blue-600 mb-4" />
                    <div className="flex mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 text-yellow-500 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      "{review.content}"
                    </p>
                  </div>

                  <div className="flex items-center mt-4">
                    <img
                      src={review.rater_image || "/default-avatar.png"}
                      alt={`${review.rater_first_name} ${review.rater_last_name}`}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.rater_first_name} {review.rater_last_name}
                      </h4>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-full">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>

          {/* --- Show "View all" if more than 4 --- */}
          {reviews.length > 4 && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition"
              >
                View All Reviews
              </button>
            </div>
          )}

          {/* --- Popup modal omitted for brevity (unchanged) --- */}

          {/* --- Form to submit/edit review --- */}
          {reviewsLoaded && !isInstructor && (!userReview || editingId) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={content}
                maxLength={100}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts about this course..."
                required
              />
              <div className="flex gap-2 items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 cursor-pointer ${
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => setRating(i + 1)}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating} / 5</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {submitting
                  ? editingId
                    ? "Updating..."
                    : "Posting..."
                  : editingId
                  ? "Update Review"
                  : "Post Review"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default CourseReviewsSection;
