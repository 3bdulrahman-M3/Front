import React, { useEffect, useState } from "react";
import {
  getCourseNotes,
  createNote,
  editNote,
  deleteNote,
  getCourse,
} from "../api/api"; // adjust path
import { Loader2 } from "lucide-react";

export default function CourseNotesSection({ courseId }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true); // fetching notes
  const [submitting, setSubmitting] = useState(false); // post/edit
  const [deletingId, setDeletingId] = useState(null); // track delete action
  const [isInstructor, setIsInstructor] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const user = JSON.parse(localStorage.getItem("user"));

  const [instructorChecked, setInstructorChecked] = useState(false);

  useEffect(() => {
    const run = async () => {
      await checkIfInstructor();
      setInstructorChecked(true); // mark that it’s done
    };
    run();
  }, []); // only once on mount

  useEffect(() => {
    if (!instructorChecked) return;
    fetchNotes(page);
  }, [page, instructorChecked]);

  const fetchNotes = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const data = await getCourseNotes(courseId, {
        page: pageNumber,
        limit: 4,
      }); // pass pagination params
      setNotes(data.results);
      setPages(data.pages);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
    setLoading(false);
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
        await editNote(editingId, { content });
      } else {
        await createNote(courseId, { content });
      }
      setContent("");
      setEditingId(null);
      fetchNotes(page);
    } catch (err) {
      console.error("Error submitting note:", err);
    }
    setSubmitting(false);
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setContent(note.content);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteNote(id);
      fetchNotes(page);
    } catch (err) {
      console.error("Error deleting note:", err);
    }
    setDeletingId(null);
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl px-8 pb-4">
      {/* <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
        Course Notes
      </h2> */}

      {/* Loading spinner */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading notes...</span>
        </div>
      ) : (
        <>
          {/* Notes list */}
          <div className="space-y-5 mb-8">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="border border-gray-100 rounded-xl bg-gray-50 p-5 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900">
                      {note.author_first_name} {note.author_last_name}
                    </p>
                    <span className="text-gray-400 text-sm">
                      {new Date(note.posted_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{note.content}</p>

                  {note.author === user?.id && (
                    <div className="flex gap-4 mt-3">
                      <button
                        className="px-4 py-1 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium shadow hover:shadow-md transition disabled:opacity-50"
                        onClick={() => handleEdit(note)}
                        disabled={submitting}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-1 rounded-md bg-red-500 text-white text-sm font-medium shadow hover:bg-red-600 transition disabled:opacity-50"
                        onClick={() => handleDelete(note.id)}
                        disabled={deletingId === note.id}
                      >
                        {deletingId === note.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No notes yet.</p>
            )}
          </div>

          {/* Pagination buttons */}
          {pages > 1 && (
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* New note form (not for instructor) */}
          {!isInstructor && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-green-500"
                rows="3"
                value={content}
                maxLength={100}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a note..."
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {submitting
                  ? editingId
                    ? "Updating..."
                    : "Posting..."
                  : editingId
                  ? "Update Note"
                  : "Post Note"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
