import React, { useEffect, useState } from "react";
import { getSessions, createSession } from "../api/api";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Video } from "lucide-react";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-7 w-7 text-blue-600" /> Peer Sessions
        </h1>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition"
        >
          <Plus className="h-5 w-5" />
          {creating ? "Creating..." : isLoggedIn ? "Start Session" : "Sign in to start"}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-600">No active sessions right now.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/sessions/${s.id}`)}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {s.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Hosted by {s.created_by_name || "Anonymous"}
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
                <Video className="h-4 w-4" /> {isLoggedIn ? "Join" : "Login to join"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;
