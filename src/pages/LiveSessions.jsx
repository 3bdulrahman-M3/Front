import React, { useEffect, useState } from "react";
import {
  getSessions,
  createSession,
  editSession,
  deleteSession,
} from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  Video,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      setError(null);
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
      setError("Failed to load sessions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setCreating(true);
    navigate(`/sessions/create`);
  };

  const handleEdit = (session) => {
    setEditingId(session.id);
    setEditTitle(session.title);

    if (session.end_date) {
      const date = new Date(session.end_date);
      // Format to YYYY-MM-DDTHH:MM in local time
      const localDateTime = date
        .toLocaleString("sv-SE")
        .replace(" ", "T")
        .slice(0, 16);
      setEditEndDate(localDateTime);
    } else {
      setEditEndDate("");
    }
  };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      const endDateUTC = editEndDate
        ? new Date(editEndDate).toISOString()
        : null;
      await editSession(id, { title: editTitle, end_date: endDateUTC });
      setEditingId(null);
      await fetchSessions();
    } catch (err) {
      console.error("Failed to edit session", err);
      setError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => setDeletingId(id);

  const handleDelete = async () => {
    try {
      await deleteSession(deletingId);
      setDeletingId(null);
      await fetchSessions();
    } catch (err) {
      console.error("Failed to delete session", err);
      setError("Failed to delete session. Try again later.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-7 w-7 text-blue-600" /> Peer Sessions
        </h1>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          {creating
            ? "Creating..."
            : isLoggedIn
            ? "Start Session"
            : "Sign in to start"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-xl shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading sessions...</span>
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-gray-600">No active sessions right now.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((s) => {
            const isOwner = currentUser?.id === s.created_by;
            const isEditing = editingId === s.id;

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition transform hover:-translate-y-1 relative"
              >
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-lg font-semibold text-gray-800 mb-2 border-b border-gray-300 focus:outline-none"
                    />
                    <input
                      type="datetime-local"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full text-sm text-gray-600 border rounded-md px-2 py-1 mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(s.id)}
                        disabled={saving}
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={saving}
                        className="flex items-center gap-1 bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      {s.title}
                    </h2>
                    {s.end_date && (
                      <p className="text-sm text-gray-500 mb-2">
                        Ends: {new Date(s.end_date).toLocaleString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mb-4">
                      Hosted by {s.host || "Anonymous"}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoggedIn) {
                          navigate("/login");
                          return;
                        }
                        navigate(`/sessions/${s.id}`);
                      }}
                      className="flex items-center gap-2 text-blue-600 font-medium"
                    >
                      <Video className="h-4 w-4" />
                      {isLoggedIn ? "Join" : "Login to join"}
                    </button>
                  </>
                )}

                {isOwner && !isEditing && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1.5 rounded-full hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => confirmDelete(s.id)}
                      className="p-1.5 rounded-full hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Delete this session?
            </h2>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
