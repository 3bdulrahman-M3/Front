import React, { useEffect, useMemo, useState } from "react";
import {
  getCourseReviews,
  createReview,
  editReview,
  deleteReview,
  getCourse,
} from "../api/api";
import {
  Star,
  Loader2,
  Quote,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Edit3,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CourseReviewsSection = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // pagination + filtering for the popup
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState(null);

  // popups
  const [showAll, setShowAll] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // inline edit states
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineContent, setInlineContent] = useState("");
  const [inlineRating, setInlineRating] = useState(5);

  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    fetchReviews(page, filter);
    checkIfInstructor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, courseId]);

  const fetchReviews = async (currentPage = 1, currentFilter = null) => {
    setLoading(true);
    try {
      const data = await getCourseReviews(courseId, {
        page: currentPage,
        limit: 6,
      });
      let list = data.results || [];
      if (currentFilter) {
        list = list.filter((r) => r.rating === currentFilter);
      }
      setReviews(list);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
      setReviewsLoaded(true);
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
      if (localStorage.getItem("user") === null) {
        console.log("User not logged in. Redirecting to login page.");
        return navigate("/login");
      }
      await createReview(courseId, { content, rating });
      setContent("");
      setRating(5);
      fetchReviews(page, filter);
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const startInlineEdit = (review) => {
    setInlineEditId(review.id);
    setInlineContent(review.content);
    setInlineRating(review.rating);
  };

  const saveInlineEdit = async (id) => {
    try {
      await editReview(id, { content: inlineContent, rating: inlineRating });
      setInlineEditId(null);
      setInlineContent("");
      setInlineRating(5);
      fetchReviews(page, filter);
    } catch (err) {
      console.error("Error editing review:", err);
    }
  };

  const cancelInlineEdit = () => {
    setInlineEditId(null);
    setInlineContent("");
    setInlineRating(5);
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    const id = deletingId;
    if (!id) return;
    try {
      await deleteReview(id);
      fetchReviews(page, filter);
    } catch (err) {
      console.error("Error deleting review:", err);
    } finally {
      setDeletingId(null);
      setShowConfirmDelete(false);
    }
  };

  const userReview = reviews.find((r) => r.rater === user?.id);

  // Outside grid: show max 4 cards
  const outsideReviews = reviews.slice(0, 4);
  const outsideCount = outsideReviews.length;

  const outsideGridCols =
    outsideCount <= 1
      ? "grid-cols-1"
      : outsideCount === 2
      ? "sm:grid-cols-2"
      : outsideCount === 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  const Stars = ({ n, onClick, editable = false }) => (
    <div className="flex mb-2">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          onClick={editable ? () => onClick(i + 1) : undefined}
          className={`h-5 w-5 ${
            i < n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } ${editable ? "cursor-pointer" : ""}`}
        />
      ))}
    </div>
  );

  const ReviewCard = ({ review }) => {
    const canManage = review.rater === user?.id;
    const isEditing = inlineEditId === review.id;

    return (
      <div className="relative bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between">
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <textarea
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={inlineContent}
              onChange={(e) => setInlineContent(e.target.value)}
              maxLength={100}
            />
            <Stars
              n={inlineRating}
              editable
              onClick={(val) => setInlineRating(val)}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelInlineEdit}
                className="px-3 py-1 rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveInlineEdit(review.id)}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Quote className="h-6 w-6 text-blue-600 mb-2" />
              <Stars n={review.rating} />
              <p className="text-gray-700 leading-relaxed">
                “{review.content}”
              </p>
            </div>

            <div className="flex items-center mt-4">
              <img
                src={review.rater_image || "/default-avatar.png"}
                alt={`${review.rater_first_name} ${review.rater_last_name}`}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {review.rater_first_name} {review.rater_last_name}
                </h4>
              </div>

              {canManage && (
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => startInlineEdit(review)}
                    className="p-2 rounded-lg hover:bg-gray-200"
                    aria-label="Edit review"
                  >
                    <Edit3 className="h-5 w-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => confirmDelete(review.id)}
                    className="p-2 rounded-lg hover:bg-gray-200"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

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
          {/* OUTSIDE GRID (max 4) */}
          <div className={`grid gap-6 mb-8 ${outsideGridCols}`}>
            {outsideReviews.length > 0 ? (
              outsideReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-full">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>

          {/* View All button only if there are more than 4 */}
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

          {/* FORM for creating new review */}
          {reviewsLoaded && !isInstructor && !userReview && (
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
                <Stars n={rating} editable onClick={(val) => setRating(val)} />
                <span className="ml-2 text-sm text-gray-600">{rating} / 5</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post Review"}
              </button>
            </form>
          )}

          {/* VIEW ALL MODAL */}
          {showAll && (
            <div className="fixed inset-0 z-40 flex items-center justify-center mt-10 py-10">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowAll(false)}
              />
              <div className="relative z-50 w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">All Reviews</h3>
                  <button
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={() => setShowAll(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-4 border-b flex items-center gap-3">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Filter by rating:
                  </span>
                  <div className="flex gap-2">
                    {[null, 5, 4, 3, 2, 1].map((val) => (
                      <button
                        key={String(val)}
                        onClick={() => {
                          setPage(1);
                          setFilter(val);
                        }}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          filter === val
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {val === null ? "All" : `${val}★`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                  {loading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                      <span className="ml-2 text-gray-600">Loading…</span>
                    </div>
                  ) : reviews.length ? (
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">
                      No reviews found.
                    </p>
                  )}
                </div>

                {/* pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </div>
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DELETE CONFIRMATION */}
          {showConfirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowConfirmDelete(false)}
              />
              <div className="relative z-50 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h4 className="text-lg font-semibold mb-2">Delete review?</h4>
                <p className="text-sm text-gray-600 mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                    onClick={() => setShowConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseReviewsSection;
