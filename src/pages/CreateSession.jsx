import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession } from "../api/api";
import { Video, Loader2 } from "lucide-react";

const CreateSession = () => {
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setCreating(true);
    try {
      const roomName = `session-${crypto.randomUUID()}`;
      const newSession = await createSession({ title, room_name: roomName });
      navigate(`/sessions/${newSession.id}`);
    } catch (err) {
      console.log("Failed to create session", err);
      //   alert("Something went wrong while creating the session.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-12 mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 mt-20 mb-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Video className="h-7 w-7 text-blue-600" /> Create a New Session
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React Study Group"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition"
        >
          {creating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <Video className="h-5 w-5" /> Create Session
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateSession;
